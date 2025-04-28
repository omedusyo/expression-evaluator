import { tokenize, TokenType } from './Tokenizer';
import { parse } from './Parser';

export function debugTokenize(input: string): void {
  console.log('Input:', input);
  console.log('Input length:', input.length);
  console.log('Characters as code points:');
  for (let i = 0; i < input.length; i++) {
    console.log(`${i}: '${input[i]}' - ${input.charCodeAt(i)}`);
  }
  
  try {
    const tokens = tokenize(input);
    console.log('Tokens:');
    tokens.forEach((token, index) => {
      console.log(`${index}: type=${TokenType[token.type]}, value='${token.value}'`);
    });
    
    try {
      const ast = parse(tokens);
      console.log('AST:', JSON.stringify(ast, null, 2));
    } catch (error) {
      console.error('Parse error:', error);
    }
  } catch (error) {
    console.error('Tokenize error:', error);
  }
}