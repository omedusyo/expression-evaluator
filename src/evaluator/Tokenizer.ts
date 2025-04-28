export enum TokenType {
  NUMBER,
  IDENTIFIER,
  OPERATOR,
  LPAREN,
  RPAREN,
  COMMA,
  EQUALS,
  KEYWORD,
  ARROW,    // => for lambda expressions
  EOF
}

export interface Token {
  type: TokenType;
  value: string;
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  // Keywords
  const keywords = ['let', 'def', 'fn'];

  while (pos < input.length) {
    const char = input[pos];

    // Skip whitespace
    if (/\s/.test(char)) {
      pos++;
      continue;
    }

    // Parse numbers
    if (/\d/.test(char)) {
      let value = '';
      while (pos < input.length && /[\d.]/.test(input[pos])) {
        value += input[pos++];
      }
      tokens.push({ type: TokenType.NUMBER, value });
      continue;
    }

    // Parse identifiers and keywords
    if (/[a-zA-Z_]/.test(char)) {
      let value = '';
      while (pos < input.length && /[a-zA-Z0-9_]/.test(input[pos])) {
        value += input[pos++];
      }
      
      // Check if it's a keyword
      if (keywords.includes(value)) {
        tokens.push({ type: TokenType.KEYWORD, value });
      } else {
        tokens.push({ type: TokenType.IDENTIFIER, value });
      }
      continue;
    }

    // Operators
    if (/[+\-*\/\^]/.test(char)) {
      tokens.push({ type: TokenType.OPERATOR, value: char });
      pos++;
      continue;
    }

    // Arrow or Equals
    if (char === '=') {
      if (pos + 1 < input.length && input[pos + 1] === '>') {
        tokens.push({ type: TokenType.ARROW, value: '=>' });
        pos += 2;
      } else {
        tokens.push({ type: TokenType.EQUALS, value: '=' });
        pos++;
      }
      continue;
    }

    // Comma
    if (char === ',') {
      tokens.push({ type: TokenType.COMMA, value: ',' });
      pos++;
      continue;
    }

    // Parentheses
    if (char === '(') {
      tokens.push({ type: TokenType.LPAREN, value: '(' });
      pos++;
      continue;
    }

    if (char === ')') {
      tokens.push({ type: TokenType.RPAREN, value: ')' });
      pos++;
      continue;
    }

    // Unknown character
    throw new Error(`Unexpected character: ${char}`);
  }

  tokens.push({ type: TokenType.EOF, value: '' });
  return tokens;
}