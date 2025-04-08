import { describe, expect, it } from 'vitest';
import { I8, I16, I32, I64, U8, U16, U32, U64 } from '../../src';

describe('Integer Data Type Tests', () => {
  it('should create a Unsigned Numbers', () => {
    const a = new U8(111);
    expect(a.toString()).toBe('111');

    const b = new U16(11111);
    expect(b.toString()).toBe('11111');

    const c = new U32(11111111);
    expect(c.toString()).toBe('11111111');

    const d = new U64(11111111111111111n);
    expect(d.toString()).toBe('11111111111111111');
  });

  it('should create a Signed Numbers', () => {
    const a = new I8(-111);
    expect(a.toString()).toBe('-111');
    const b = new I16(-11111);
    expect(b.toString()).toBe('-11111');
    const c = new I32(-11111111);
    expect(c.toString()).toBe('-11111111');
    const d = new I64(-11111111111111111n);
    expect(d.toString()).toBe('-11111111111111111');
  });

  it('should throw if out of range', () => {
    expect(() => new U8(256)).toThrowError('Value must be in range [0, 255]');
    expect(() => new U16(65536)).toThrowError(
      'Value must be in range [0, 65535]'
    );
    expect(() => new U32(4294967296n)).toThrowError(
      'Value must be in range [0, 4294967295]'
    );
    expect(() => new U64(18446744073709551616n)).toThrowError(
      'Value must be in range [0, 18446744073709551615]'
    );

    expect(() => new I8(-129)).toThrowError(
      'Value must be in range [-128, 127]'
    );
    expect(() => new I16(-32769)).toThrowError(
      'Value must be in range [-32768, 32767]'
    );
    expect(() => new I32(-2147483649)).toThrowError(
      'Value must be in range [-2147483648, 2147483647]'
    );
    expect(() => new I64(-9223372036854775809n)).toThrowError(
      'Value must be in range [-9223372036854775808, 9223372036854775807]'
    );
  });
  it('should perform wrapping addition', () => {
    const a = new U8(100);
    const b = new U8(200);
    const c = a.wrappingAdd(b);
    expect(c.toString()).toBe('44');
  });
  it('should perform wrapping subtraction', () => {
    const a = new U8(100);
    const b = new U8(200);
    const c = a.wrappingSub(b);
    expect(c.toString()).toBe('156');
  });
  it('should perform wrapping multiplication', () => {
    const a = new U8(100);
    const b = new U8(200);
    const c = a.wrappingMul(b);
    expect(c.toString()).toBe('32');
  });
});
