import { Token, TokenType, tokenize } from './Tokenizer';
import { Expression, parse } from './Parser';

// Define a type for our functions
interface FunctionDefinition {
  params: string[];
  body: Expression;
}

// Define a type for closures
interface Closure {
  params: string[];
  body: Expression;
  environment: Map<string, number>;
}

class Evaluator {
  private variables: Map<string, number | Closure> = new Map();
  private functions: Map<string, FunctionDefinition> = new Map();
  
  public getVariables(): Map<string, number> {
    // Filter out closures and only return number variables
    const numberVars = new Map<string, number>();
    for (const [key, value] of this.variables.entries()) {
      if (typeof value === 'number') {
        numberVars.set(key, value);
      }
    }
    return numberVars;
  }
  
  public getClosures(): string[] {
    // Return names of closure variables
    return Array.from(this.variables.entries())
      .filter(([_, value]) => typeof value !== 'number')
      .map(([key, _]) => key);
  }
  
  public getFunctions(): string[] {
    return Array.from(this.functions.keys());
  }

  public evaluate(input: string): number | string {
    // Check if it's a variable declaration
    if (input.startsWith('let ')) {
      return this.processVariableDeclaration(input.substring(4).trim());
    }
    
    // Check if it's a function definition
    if (input.startsWith('def ')) {
      return this.processFunctionDefinition(input.substring(4).trim());
    }

    // Otherwise evaluate as an expression
    const tokens = tokenize(input);
    const ast = parse(tokens);
    const result = this.evaluateExpression(ast);
    
    // Convert closure to string representation
    if (typeof result !== 'number') {
      const params = result.params.join(', ');
      return `<function(${params})>`;
    }
    
    return result;
  }
  
  private processFunctionDefinition(definition: string): string {
    // Parse the function definition: "f(x) = 1 + x*x"
    const match = definition.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*([^)]*)\s*\)\s*=\s*(.+)$/);
    
    if (!match) {
      throw new Error('Invalid function definition. Format: def name(param1, param2, ...) = expression');
    }
    
    const functionName = match[1];
    const paramString = match[2];
    const bodyString = match[3];
    
    // Parse the parameters
    const params = paramString.split(',').map(p => p.trim()).filter(p => p !== '');
    
    // Validate parameter names
    for (const param of params) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(param)) {
        throw new Error(`Invalid parameter name: ${param}`);
      }
    }
    
    // Check for duplicate parameters
    if (new Set(params).size !== params.length) {
      throw new Error('Duplicate parameter names in function definition');
    }
    
    // Parse the body expression
    const tokens = tokenize(bodyString);
    const bodyAst = parse(tokens);
    
    // Store the function
    this.functions.set(functionName, { params, body: bodyAst });
    
    return `Function ${functionName}(${params.join(', ')}) defined`;
  }

  private processVariableDeclaration(declaration: string): string {
    // Find the first equals sign that's not part of an arrow (=>)
    let eqPos = -1;
    for (let i = 0; i < declaration.length; i++) {
      if (declaration[i] === '=' && (i + 1 >= declaration.length || declaration[i + 1] !== '>')) {
        eqPos = i;
        break;
      }
    }
    
    if (eqPos === -1) {
      throw new Error('Invalid variable declaration. Format: let name = expression');
    }
    
    const variableName = declaration.substring(0, eqPos).trim();
    const expression = declaration.substring(eqPos + 1).trim();
    
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variableName)) {
      throw new Error(`Invalid variable name: ${variableName}`);
    }

    try {
      const tokens = tokenize(expression);
      const ast = parse(tokens);
      const value = this.evaluateExpression(ast);

      this.variables.set(variableName, value);
      
      // Format the return value based on the type
      if (typeof value !== 'number') {
        const params = value.params.join(', ');
        return `${variableName} = <function(${params})>`;
      }
      
      return `${variableName} = ${value}`;
    } catch (error) {
      throw error;
    }
  }

  private evaluateExpression(expr: Expression, localVars: Map<string, number | Closure> = new Map()): number | Closure {
    switch (expr.type) {
      case 'number':
        return expr.value;
      
      case 'lambda':
        // Create a closure by capturing the current environment
        const capturedEnv = new Map<string, number>();
        
        // Copy local variables (excluding closures)
        for (const [key, value] of localVars.entries()) {
          if (typeof value === 'number') {
            capturedEnv.set(key, value);
          }
        }
        
        // Copy global variables (excluding closures)
        for (const [key, value] of this.variables.entries()) {
          if (typeof value === 'number' && !capturedEnv.has(key)) {
            capturedEnv.set(key, value);
          }
        }
        
        // Return a closure
        return {
          params: expr.params,
          body: expr.body,
          environment: capturedEnv
        };
      
      case 'variable':
        // First check local variables (function parameters)
        const localValue = localVars.get(expr.name);
        if (localValue !== undefined) {
          return localValue;
        }
        
        // Then check global variables
        const globalValue = this.variables.get(expr.name);
        if (globalValue !== undefined) {
          return globalValue;
        }
        
        throw new Error(`Undefined variable: ${expr.name}`);
      
      case 'binary':
        const left = this.evaluateExpression(expr.left, localVars);
        const right = this.evaluateExpression(expr.right, localVars);
        
        // Binary operations only work on numbers
        if (typeof left !== 'number' || typeof right !== 'number') {
          throw new Error('Cannot perform arithmetic operations on functions');
        }
        
        switch (expr.operator) {
          case '+':
            return left + right;
          case '-':
            return left - right;
          case '*':
            return left * right;
          case '/':
            if (right === 0) {
              throw new Error('Division by zero');
            }
            return left / right;
          case '^':
            return Math.pow(left, right);
          default:
            throw new Error(`Unknown operator: ${expr.operator}`);
        }
      
      case 'functionCall':
        return this.evaluateFunctionCall(expr, localVars);

      default:
        throw new Error(`Unknown expression type: ${(expr as any).type}`);
    }
  }
  
  private evaluateFunctionCall(expr: { type: 'functionCall'; name: string; args: Expression[]; lambda?: Expression }, localVars: Map<string, number | Closure>): number | Closure {
    // Check if this is an anonymous lambda expression call
    if (expr.name === '__anonymous__' && expr.lambda) {
      // Evaluate the lambda to get a closure
      const closure = this.evaluateExpression(expr.lambda, localVars) as Closure;
      
      if (typeof closure === 'number') {
        throw new Error('Expected a function, got a number');
      }
      
      // Check argument count
      if (expr.args.length !== closure.params.length) {
        throw new Error(`Anonymous function expects ${closure.params.length} arguments, but got ${expr.args.length}`);
      }
      
      // Evaluate arguments
      const argValues = expr.args.map(arg => this.evaluateExpression(arg, localVars));
      
      // Create local environment for function execution
      const funcLocalVars = new Map<string, number | Closure>(closure.environment);
      
      // Bind parameters to arguments
      for (let i = 0; i < closure.params.length; i++) {
        funcLocalVars.set(closure.params[i], argValues[i]);
      }
      
      // Evaluate function body
      return this.evaluateExpression(closure.body, funcLocalVars);
    }
    
    // First, try to find a named function
    const namedFunc = this.functions.get(expr.name);
    
    // If we found a named function, evaluate it
    if (namedFunc) {
      // Check argument count
      if (expr.args.length !== namedFunc.params.length) {
        throw new Error(`Function ${expr.name} expects ${namedFunc.params.length} arguments, but got ${expr.args.length}`);
      }
      
      // Evaluate arguments
      const argValues = expr.args.map(arg => this.evaluateExpression(arg, localVars));
      
      // Create a new local variable environment for the function execution
      const funcLocalVars = new Map<string, number | Closure>();
      
      // Bind parameter names to argument values
      for (let i = 0; i < namedFunc.params.length; i++) {
        funcLocalVars.set(namedFunc.params[i], argValues[i]);
      }
      
      // Evaluate the function body with the local variables
      return this.evaluateExpression(namedFunc.body, funcLocalVars);
    }
    
    // If it's not a named function, check if it's a closure variable
    const closureVar = localVars.get(expr.name) || this.variables.get(expr.name);
    
    // If we found a closure, evaluate it
    if (closureVar && typeof closureVar !== 'number') {
      const closure = closureVar as Closure;
      
      // Check argument count
      if (expr.args.length !== closure.params.length) {
        throw new Error(`Function ${expr.name} expects ${closure.params.length} arguments, but got ${expr.args.length}`);
      }
      
      // Evaluate arguments
      const argValues = expr.args.map(arg => this.evaluateExpression(arg, localVars));
      
      // Create a new local variable environment based on the closure's captured environment
      const closureLocalVars = new Map<string, number | Closure>(closure.environment);
      
      // Bind parameter names to argument values
      for (let i = 0; i < closure.params.length; i++) {
        closureLocalVars.set(closure.params[i], argValues[i]);
      }
      
      // Evaluate the function body with the closure's environment plus arguments
      return this.evaluateExpression(closure.body, closureLocalVars);
    }
    
    throw new Error(`Undefined function or closure: ${expr.name}`);
  }
}

export default Evaluator;