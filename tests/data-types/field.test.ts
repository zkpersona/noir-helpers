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

  it('should throw error for non-integer input', () => {
    expect(() => new Field(1.5)).toThrowError('Field input must be an integer');
  });

  it('should take values up to MAX_FIELD_SIZE', () => {
    const field = new Field(
      21888242871839275222246405745257275088548364400416034343698204186575808495616n
    );
    expect(field.toString()).equals(
      '21888242871839275222246405745257275088548364400416034343698204186575808495616'.toString()
    );
  });

  it('should throw error for value > 2^254', () => {
    expect(() => new Field(2n ** 254n)).toThrowError(
      'Field value must be between -MAX_FIELD_SIZE and MAX_FIELD_SIZE'
    );
  });

  it('should correctly compute little-endian bit decomposition', () => {
    const field = new Field(300n);
    const bytes = field.toLeBits(9);
    expect(bytes).toEqual([0, 0, 1, 1, 0, 1, 0, 0, 1]);
  });

  it('should throw error for little-endian bit decomposition with invalid length', () => {
    const field = new Field(300n);
    expect(() => field.toLeBits(8)).toThrowError(
      'Length must be between 9 and 254'
    );
  });

  it('should correctly compute big-endian bit decomposition', () => {
    const field = new Field(300n);
    const bytes = field.toBeBits(9);
    expect(bytes).toEqual([1, 0, 0, 1, 0, 1, 1, 0, 0]);
  });

  it('should throw error for big-endian bit decomposition with invalid length', () => {
    const field = new Field(300n);
    expect(() => field.toBeBits(8)).toThrowError(
      'Length must be between 9 and 254'
    );
  });

  it('should correctly compute little-endian byte decomposition', () => {
    const field = new Field(300n);
    const bytes = field.toLeBytes(2);
    expect(bytes).toEqual([44, 1]);
  });

  it('should throw error for little-endian byte decomposition with invalid length', () => {
    const field = new Field(300n);
    expect(() => field.toLeBytes(1)).toThrowError(
      'Length must be between 2 and 32'
    );
  });

  it('should correctly compute big-endian byte decomposition', () => {
    const field = new Field(300n);
    const bytes = field.toBeBytes(2);
    expect(bytes).toEqual([1, 44]);
  });

  it('should throw error for big-endian byte decomposition with invalid length', () => {
    const field = new Field(300n);
    expect(() => field.toBeBytes(1)).toThrowError(
      'Length must be between 2 and 32'
    );
  });

  it('should correctly compute little-endian radix conversion', () => {
    const field = new Field(300n);
    const digits = field.toLeRadix(2, 16);
    expect(digits).toEqual([0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('should throw error for radix not a power of 2', () => {
    const field = new Field(300n);
    expect(() => field.toLeRadix(3, 9)).toThrowError(
      'radix must be a power of 2'
    );
  });

  it('should throw error for little-endian radix conversion with invalid length', () => {
    const field = new Field(300n);
    expect(() => field.toLeRadix(2, 8)).toThrowError(
      'Length must be between 16 and 256'
    );
  });

  it('should correctly compute big-endian radix conversion', () => {
    const field = new Field(300n);
    const digits = field.toBeRadix(2, 16);
    expect(digits).toEqual([0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0]);
  });

  it('should throw error for big-endian radix conversion with invalid length', () => {
    const field = new Field(300n);
    expect(() => field.toBeRadix(2, 8)).toThrowError(
      'Length must be between 16 and 256'
    );
  });

  it('should correctly compute power', () => {
    const base = new Field(2n);
    const exp = new Field(3n);
    const result = base.pow32(exp);
    expect(result.toString()).toEqual('8');
  });

  it('should correctly compute power for large values', () => {
    const base = new Field(2);
    const exp = new Field(2 ** 32 - 1);
    const res = base.pow32(exp);
    expect(res.toHex()).equals(
      '0x4aa46b15346c19ec569802276feb4778e1921469782ef1287716e7712fb8f70'
    );
  });

  it('should throw error exponents >= 2^32', () => {
    const base = new Field(2);
    const exp = new Field(2 ** 32);
    expect(() => base.pow32(exp)).toThrowError(
      'Exponent too large: exceeds 2^32 limit'
    );
  });

  it('should assert max bit size', () => {
    const field = new Field(
      21888242871839275222246405745257275088548364400416034343698204186575808495616n
    );
    expect(() => field.assertMaxBitSize(254)).not.toThrow();
  });

  it('should throw error for wrong bit size assert', () => {
    const field = new Field(300n);
    expect(() => field.assertMaxBitSize(8)).toThrowError(
      'Field value exceeds 8 bits'
    );
  });

  it('should correctly compute sgn0', () => {
    const field = new Field(0n);
    expect(field.sgn0()).toEqual(0);

    const field1 = new Field(1n);
    expect(field1.sgn0()).toEqual(1);

    const field2 = new Field(2n);
    expect(field2.sgn0()).toEqual(0);
  });

  it('should correctly compute sgn0 for large values', () => {
    const field = new Field(2000000000n).pow32(new Field(2000000000n));
    expect(field.sgn0()).toEqual(1);
  });

  it('should correctly add two field values', () => {
    const a = new Field(10n);
    const b = new Field(20n);
    const c = a.add(b);
    expect(c.toString()).toEqual('30');
  });

  it('should correctly add two field values with large values', () => {
    const large = new Field(
      '0x0acebbaf4c77ac3e5ef3a6bbdef2c677a2b86c827ff5e99e6f8d89bd10a4d3d3'
    );

    const result = large.add(large);
    expect(result.toHex()).equals(
      '0x159d775e98ef587cbde74d77bde58cef4570d904ffebd33cdf1b137a2149a7a6'
    );
  });

  it('should correctly subtract two field values', () => {
    const a = new Field(10n);
    const b = new Field(20n);
    const c = b.sub(a);
    expect(c.toString()).toEqual('10');
  });

  it('should correctly subtract two field values with large values', () => {
    const large1 = new Field(
      '0x0acebbaf4c77ac3e5ef3a6bbdef2c677a2b86c827ff5e99e6f8d89bd10a4d3d3'
    );

    const large2 = new Field(
      '0x159d775e98ef587cbde74d77bde58cef4570d904ffebd33cdf1b137a2149a7a6'
    );

    const result = large2.sub(large1);
    expect(result.toHex()).equals(
      '0xacebbaf4c77ac3e5ef3a6bbdef2c677a2b86c827ff5e99e6f8d89bd10a4d3d3'
    );
  });

  it('should correctly multiply two field values', () => {
    const a = new Field(10n);
    const b = new Field(20n);
    const c = a.mul(b);
    expect(c.toString()).toEqual('200');
  });

  it('should correctly multiply two field values with large values', () => {
    const a = new Field(
      '0x0acebbaf4c77ac3e5ef3a6bbdef2c677a2b86c827ff5e99e6f8d89bd10a4d3d3'
    );

    const b = new Field(2);
    const c = a.mul(b);
    expect(c.toHex()).equals(
      '0x159d775e98ef587cbde74d77bde58cef4570d904ffebd33cdf1b137a2149a7a6'
    );
  });

  it('should correctly divide two field values', () => {
    const a = new Field(100n);
    const b = new Field(20n);
    const c = a.div(b);
    expect(c.toString()).toEqual('5');
  });

  it('should correctly divide two field values with large values', () => {
    const a = new Field(
      '0x159d775e98ef587cbde74d77bde58cef4570d904ffebd33cdf1b137a2149a7a6'
    );

    const b = new Field(2);
    const c = a.div(b);
    expect(c.toHex()).equals(
      '0xacebbaf4c77ac3e5ef3a6bbdef2c677a2b86c827ff5e99e6f8d89bd10a4d3d3'
    );
  });

  it('should correctly mod two field values', () => {
    const a = new Field(100n);
    const b = new Field(20n);
    const c = a.mod(b);
    expect(c.toString()).toEqual('0');
  });

  it('should correctly mod two field values with large values', () => {
    const a = new Field(
      '0x159d775e98ef587cbde74d77bde58cef4570d904ffebd33cdf1b137a2149a7a6'
    );

    const b = new Field(
      '0x0acebbaf4c77ac3e5ef3a6bbdef2c677a2b86c827ff5e99e6f8d89bd10a4d3d3'
    );
    const c = a.mod(b);
    expect(c.toString()).toEqual('0');
  });

  it('should throw error for mod by zero', () => {
    const a = new Field(100n);
    expect(() => a.mod(0n)).toThrowError('Cannot modulo by zero');
  });

  it('should clone a field value', () => {
    const a = new Field(100n);
    const b = a.clone();
    expect(b.toString()).toEqual('100');
  });
});
