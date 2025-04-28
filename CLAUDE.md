# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Test Commands
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Test: `npm run test`
- Run single test: `npm run test -- -t "test name"`
- Lint: `npm run lint`

## Code Style Guidelines
- **Formatting**: Use 2-space indentation and max 100 chars per line
- **Naming**: camelCase for variables/functions, PascalCase for classes/interfaces/types
- **Components**: Use functional React components with hooks
- **Types**: Always use explicit TypeScript types, avoid `any`
- **Error Handling**: Use try/catch and provide descriptive error messages
- **Architecture**: 
  - Keep evaluator logic separate from UI components
  - Use proper lexer/parser/evaluator separation of concerns
- **Git**: Keep commits focused on single logical changes