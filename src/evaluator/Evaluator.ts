import { Token, TokenType, tokenize } from './Tokenizer';
import { Expression, parse } from './Parser';

class Evaluator {
  private variables: Map<string, number> = new Map();

  public evaluate(input: string): number | string {
    // Check if it's a variable declaration
    if (input.startsWith('let ')) {
      return this.processVariableDeclaration(input.substring(4).trim());
    }

    // Otherwise evaluate as an expression
    const tokens = tokenize(input);
    const ast = parse(tokens);
    return this.evaluateExpression(ast);
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

  private evaluateExpression(expr: Expression): number {
    switch (expr.type) {
      case 'number':
        return expr.value;
      
      case 'variable':
        const value = this.variables.get(expr.name);
        if (value === undefined) {
          throw new Error(`Undefined variable: ${expr.name}`);
        }
        return value;
      
      case 'binary':
        const left = this.evaluateExpression(expr.left);
        const right = this.evaluateExpression(expr.right);
        
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

      default:
        throw new Error(`Unknown expression type: ${(expr as any).type}`);
    }
  }
}

export default Evaluator;