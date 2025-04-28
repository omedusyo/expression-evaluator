import { Token, TokenType } from './Tokenizer';

export type Expression =
  | { type: 'number'; value: number }
  | { type: 'variable'; name: string }
  | { type: 'binary'; operator: string; left: Expression; right: Expression }
  | { type: 'functionCall'; name: string; args: Expression[] };

export function parse(tokens: Token[]): Expression {
  let current = 0;

  function peek(): Token {
    return tokens[current];
  }

  function consume(): Token {
    return tokens[current++];
  }

  function match(type: TokenType): boolean {
    if (peek().type === type) {
      consume();
      return true;
    }
    return false;
  }

  // Grammar implementation
  // expression -> additive
  // additive -> multiplicative ([+-] multiplicative)*
  // multiplicative -> power ([*/] power)*
  // power -> primary (^ primary)*
  // primary -> NUMBER | IDENTIFIER | '(' expression ')'

  function expression(): Expression {
    return additive();
  }

  function additive(): Expression {
    let left = multiplicative();

    while (peek().type === TokenType.OPERATOR && (peek().value === '+' || peek().value === '-')) {
      const operator = consume().value;
      const right = multiplicative();
      left = { type: 'binary', operator, left, right };
    }

    return left;
  }

  function multiplicative(): Expression {
    let left = power();

    while (peek().type === TokenType.OPERATOR && (peek().value === '*' || peek().value === '/')) {
      const operator = consume().value;
      const right = power();
      left = { type: 'binary', operator, left, right };
    }

    return left;
  }

  function power(): Expression {
    let left = primary();

    while (peek().type === TokenType.OPERATOR && peek().value === '^') {
      const operator = consume().value;
      const right = primary();
      left = { type: 'binary', operator, left, right };
    }

    return left;
  }

  function primary(): Expression {
    const token = peek();

    if (match(TokenType.NUMBER)) {
      return { type: 'number', value: parseFloat(token.value) };
    }

    if (token.type === TokenType.IDENTIFIER) {
      // Check for function call syntax
      const name = consume().value;
      
      if (peek().type === TokenType.LPAREN) {
        // This is a function call
        consume(); // consume the left paren
        const args: Expression[] = [];
        
        // Handle empty argument list
        if (peek().type !== TokenType.RPAREN) {
          args.push(expression());
          
          // Parse additional arguments
          while (peek().type === TokenType.COMMA) {
            consume(); // consume comma
            args.push(expression());
          }
        }
        
        // Ensure we have a closing parenthesis
        if (!match(TokenType.RPAREN)) {
          throw new Error('Expected closing parenthesis in function call');
        }
        
        return { type: 'functionCall', name, args };
      }
      
      // It's a regular variable reference
      return { type: 'variable', name };
    }

    if (match(TokenType.LPAREN)) {
      const expr = expression();
      if (!match(TokenType.RPAREN)) {
        throw new Error('Expected closing parenthesis');
      }
      return expr;
    }

    throw new Error(`Unexpected token: ${token.value}`);
  }

  // Start parsing from the entry point
  const result = expression();

  // Ensure we consumed all tokens
  if (current < tokens.length - 1) { // Accounting for EOF token
    throw new Error('Unexpected tokens at the end of input');
  }

  return result;
}