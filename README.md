# Expression Evaluator

A simple web-based REPL for evaluating arithmetic expressions with variable support.

## Features

- Evaluate arithmetic expressions (`2 + 3 * 4`)
- Support for operators: `+`, `-`, `*`, `/`, `^` (exponentiation)
- Parentheses for grouping (`(2 + 3) * 4`)
- Variable definition (`let x = 5`)
- Variable usage in expressions (`x + 10`)
- Expression history

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

## Implementation Details

The application uses a classic approach to expression evaluation:

1. **Tokenizer**: Converts input string into tokens
2. **Parser**: Builds an abstract syntax tree (AST) from tokens
3. **Evaluator**: Evaluates the AST to produce a result

### Grammar

```
expression -> additive
additive -> multiplicative ([+-] multiplicative)*
multiplicative -> power ([*/] power)*
power -> primary (^ primary)*
primary -> NUMBER | IDENTIFIER | '(' expression ')'
```