# Expression Evaluator

A web-based REPL for evaluating arithmetic expressions with support for variables, functions, and closures.

## Features

- Evaluate arithmetic expressions (`2 + 3 * 4`)
- Support for operators: `+`, `-`, `*`, `/`, `^` (exponentiation)
- Parentheses for grouping (`(2 + 3) * 4`)
- Variable definition (`let x = 5`)
- Variable usage in expressions (`x + 10`)
- Function definition (`def f(x) = x * x`)
- First-class functions and closures (`let add = fn(x) => x + 1`)
- Higher-order functions (`let makeAdder = fn(n) => fn(x) => x + n`)
- Expression history
- Current environment display (variables, functions, and closures)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/expression-evaluator.git
cd expression-evaluator

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

This will start the development server at http://localhost:5173.

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## How to Use

1. Enter an arithmetic expression (e.g., `2 + 3 * 4`) in the input field
2. Press Enter to evaluate the expression
3. The result will be displayed below the input field
4. To define a variable, use the `let` keyword (e.g., `let x = 10`)
5. Variables can be used in subsequent expressions (e.g., `x * 5`)
6. To define a function, use the `def` keyword (e.g., `def square(x) = x * x`)
7. Call functions with arguments (e.g., `square(5)`)
8. Define closures with the `fn` keyword (e.g., `let add = fn(x) => x + 1`)
9. Create higher-order functions (e.g., `let makeAdder = fn(n) => fn(x) => x + n`)
10. Call anonymous functions directly (e.g., `(fn(x) => x * x)(4)`)

## Implementation Details

The application uses a classic approach to expression evaluation:

1. **Tokenizer**: Converts input string into tokens
2. **Parser**: Builds an abstract syntax tree (AST) from tokens
3. **Evaluator**: Evaluates the AST to produce a result

### Grammar

```
expression        -> additive
additive          -> multiplicative ([+-] multiplicative)*
multiplicative    -> power ([*/] power)*
power             -> primary (^ primary)*
primary           -> NUMBER | IDENTIFIER | functionCall | lambda | '(' expression ')'
functionCall      -> IDENTIFIER '(' (expression (',' expression)*)? ')'
lambda            -> 'fn' '(' (IDENTIFIER (',' IDENTIFIER)*)? ')' '=>' expression
```

### Environment

The evaluator maintains three types of values:
- **Variables**: Numeric values assigned with `let` (e.g., `let x = 5`)
- **Functions**: Named functions defined with `def` (e.g., `def f(x) = x + 1`)
- **Closures**: First-class functions that capture their lexical environment

The application UI displays the current state of all three environments, making it easy to see what variables, functions, and closures are available.