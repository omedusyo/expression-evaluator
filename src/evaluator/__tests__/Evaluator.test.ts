import { describe, it, expect, beforeEach } from 'vitest';
import Evaluator from '../Evaluator';

describe('Evaluator', () => {
  let evaluator: Evaluator;

  beforeEach(() => {
    evaluator = new Evaluator();
  });

  describe('basic arithmetic operations', () => {
    it('evaluates addition', () => {
      expect(evaluator.evaluate('2 + 3')).toBe(5);
    });

    it('evaluates subtraction', () => {
      expect(evaluator.evaluate('5 - 3')).toBe(2);
    });

    it('evaluates multiplication', () => {
      expect(evaluator.evaluate('2 * 3')).toBe(6);
    });

    it('evaluates division', () => {
      expect(evaluator.evaluate('6 / 2')).toBe(3);
    });

    it('evaluates exponentiation', () => {
      expect(evaluator.evaluate('2 ^ 3')).toBe(8);
    });
  });

  describe('operator precedence', () => {
    it('respects operator precedence', () => {
      expect(evaluator.evaluate('2 + 3 * 4')).toBe(14);
      expect(evaluator.evaluate('(2 + 3) * 4')).toBe(20);
    });

    it('handles multiple operations with precedence', () => {
      expect(evaluator.evaluate('2 + 3 * 4 - 5 / 5')).toBe(13);
    });

    it('handles exponentiation precedence', () => {
      expect(evaluator.evaluate('2 * 3 ^ 2')).toBe(18);
      expect(evaluator.evaluate('(2 * 3) ^ 2')).toBe(36);
    });
  });

  describe('variable management', () => {
    it('defines and retrieves variables', () => {
      evaluator.evaluate('let x = 5');
      expect(evaluator.evaluate('x')).toBe(5);
    });

    it('uses variables in expressions', () => {
      evaluator.evaluate('let x = 5');
      evaluator.evaluate('let y = 3');
      expect(evaluator.evaluate('x + y')).toBe(8);
    });

    it('updates existing variables', () => {
      evaluator.evaluate('let x = 5');
      evaluator.evaluate('let x = 10');
      expect(evaluator.evaluate('x')).toBe(10);
    });

    it('uses variables in variable definitions', () => {
      evaluator.evaluate('let x = 5');
      evaluator.evaluate('let y = x * 2');
      expect(evaluator.evaluate('y')).toBe(10);
    });
  });

  describe('error handling', () => {
    it('throws error for undefined variables', () => {
      expect(() => evaluator.evaluate('x')).toThrow('Undefined variable: x');
    });

    it('throws error for invalid expressions', () => {
      expect(() => evaluator.evaluate('2 +')).toThrow();
    });

    it('throws error for division by zero', () => {
      expect(() => evaluator.evaluate('5 / 0')).toThrow('Division by zero');
    });

    it('throws error for invalid variable names', () => {
      expect(() => evaluator.evaluate('let 2x = 5')).toThrow('Invalid variable name');
    });
  });
});