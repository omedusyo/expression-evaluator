import { Token, TokenType, tokenize } from './Tokenizer';
import { Expression, parse } from './Parser';

// Define a type for our functions
interface FunctionDefinition {
  params: string[];
  body: Expression;
}

class Evaluator {
  private variables: Map<string, number> = new Map();
  private functions: Map<string, FunctionDefinition> = new Map();
  
  public getVariables(): Map<string, number> {
    return new Map(this.variables);
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
    return this.evaluateExpression(ast);
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
    const parts = declaration.split('=');
    if (parts.length !== 2) {
      throw new Error('Invalid variable declaration. Format: let name = expression');
    }

    const variableName = parts[0].trim();
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variableName)) {
      throw new Error(`Invalid variable name: ${variableName}`);
    }

    const expression = parts[1].trim();
    const tokens = tokenize(expression);
    const ast = parse(tokens);
    const value = this.evaluateExpression(ast);

    this.variables.set(variableName, value);
    return `${variableName} = ${value}`;
  }

  private evaluateExpression(expr: Expression, localVars: Map<string, number> = new Map()): number {
    switch (expr.type) {
      case 'number':
        return expr.value;
      
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
  
  private evaluateFunctionCall(expr: { type: 'functionCall'; name: string; args: Expression[] }, localVars: Map<string, number>): number {
    const func = this.functions.get(expr.name);
    if (!func) {
      throw new Error(`Undefined function: ${expr.name}`);
    }
    
    // Check argument count
    if (expr.args.length !== func.params.length) {
      throw new Error(`Function ${expr.name} expects ${func.params.length} arguments, but got ${expr.args.length}`);
    }
    
    // Evaluate arguments
    const argValues = expr.args.map(arg => this.evaluateExpression(arg, localVars));
    
    // Create a new local variable environment for the function execution
    const funcLocalVars = new Map(localVars);
    
    // Bind parameter names to argument values
    for (let i = 0; i < func.params.length; i++) {
      funcLocalVars.set(func.params[i], argValues[i]);
    }
    
    // Evaluate the function body with the local variables
    return this.evaluateExpression(func.body, funcLocalVars);
  }
}

export default Evaluator;