import { describe, expect, it } from 'vitest';
import { Field } from '../../src';

describe('Field Data Type Tests', () => {
  it('should create a field instance from a number', () => {
    const field = new Field(42);
    expect(field.toString()).equals('42');
  });

  it('should create a field instance from a string', () => {
    const field = new Field('42');
    expect(field.toString()).equals('42');
  });

  it('should create a field instance from a bigint', () => {
    const field = new Field(42n);
    expect(field.toString()).equals('42');
  });

  it('should throw error for negative input', () => {
    expect(() => new Field(-1)).toThrowError(
      'Field input must be non-negative'
    );
  });

  it('should throw error for non-integer input', () => {
    expect(() => new Field(1.5)).toThrowError('Field input must be an integer');
  });

  it('should take values up to 2 ^ 254', () => {
    const field = new Field(2n ** 254n - 1n);
    expect(field.toString()).equals((2n ** 254n - 1n).toString());
  });

  it('should throw error for value > 2^254', () => {
    expect(() => new Field(2n ** 256n)).toThrowError(
      'Field value exceeds 254 bits'
    );
  });
});
