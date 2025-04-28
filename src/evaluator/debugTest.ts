import { tokenize, TokenType } from './Tokenizer';
import { parse } from './Parser';
import Evaluator from './Evaluator';

// Test the issue with lambda expression
const expr = 'fn(x) => x + 1';
console.log('\n=== Testing lambda expression ===');
try {
  const tokens = tokenize(expr);
  console.log('Tokens:');
  tokens.forEach((token, index) => {
    console.log(`${index}: type=${TokenType[token.type]}, value='${token.value}'`);
  });
  
  const ast = parse(tokens);
  console.log('AST:', JSON.stringify(ast, null, 2));
  
  const evaluator = new Evaluator();
  const result = evaluator.evaluate(expr);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}

// Test the variable declaration with lambda
const varDecl = 'let f = fn(x) => x + 1';
console.log('\n=== Testing variable declaration with lambda ===');
try {
  const evaluator = new Evaluator();
  const declResult = evaluator.evaluate(varDecl);
  console.log('Declaration result:', declResult);
  
  // Now try to use the function
  const applyResult = evaluator.evaluate('f(5)');
  console.log('Applied function result:', applyResult);
} catch (error) {
  console.error('Error:', error);
}