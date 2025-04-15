import { inspect } from 'node:util';
import type { Bit } from '~/types';
import { type FieldInput, FieldValidator } from './zod';

/**
 * Represents a finite field element used in noir.
 *
 * The Field class implements operations and conversions for field elements that are compatible
 * with Noir's default proving backend with the Grumpkin curve, and fields size of  254-bits.
 *
 * This class provides:
 * - Core conversions between different representations (bits, bytes, radix)
 * - Mathematical operations (addition, subtraction, multiplication, division)
 * - Cryptographic operations (sign determination)
 * - Validation and safety checks
 * - Serialization methods
 *
 * @example
 * ```typescript
 * const field = new Field(42n);
 * const bits = field.toLeBits(8); // [0, 1, 0, 1, 0, 1, 0, 0]
 * const sum = field.add(58n); // new Field(100n)
 * ```
 */
export class Field {
  /** The internal bigint representation of the field value */
  readonly value: bigint;

  /** The maximum bit size of a Field */
  static readonly MAX_BIT_SIZE = 254n;

  /** The modulus of the field */
  static readonly MODULUS =
    21888242871839275222246405745257275088548364400416034343698204186575808495617n;

  /**
   * Creates a new Field instance from various input types.
   *
   * @param input - The input value to convert to a field element
   * @throws Error if the input cannot be parsed as a valid field value
   */
  constructor(input: FieldInput) {
    const parsed = FieldValidator.parse(input);
    this.value = parsed % Field.MODULUS;
  }

  [inspect.custom]() {
    return `Field<${this.value.toString()}>`;
  }

  /**
   * Internal helper function to compute the log2 of a large value (0-2^254).
   *
   * @param value - The value to compute the log2 of
   * @returns The log2 of the value
   */
  private log2(value: bigint): bigint {
    if (value <= 0n) {
      throw new Error('log2 is undefined for non-positive values');
    }

    let result = 0n;
    let v = value;

    while (v > 1n) {
      v >>= 1n;
      result += 1n;
    }

    return result;
  }

  /**
   * Converts the field value to an array of bits in little-endian order.
   *
   * @param length - The number of bits to extract
   * @returns An array of bits (0 or 1) in little-endian order
   * @throws Error if length is negative or exceeds Field.MAX_BIT_SIZE or if length is less than the minimum required bits to represent the value
   */
  toLeBits<N extends number>(length: N): Bit[] {
    const minLengthRequired =
      this.value === 0n ? 0 : Math.ceil(Number(this.log2(this.value)) + 1);
    if (length < minLengthRequired || length > Field.MAX_BIT_SIZE) {
      throw new Error(
        `Length must be between ${minLengthRequired} and ${Field.MAX_BIT_SIZE}`
      );
    }

    const bits: Bit[] = [];
    for (let i = 0; i < length; i++) {
      const bit = (this.value >> BigInt(i)) & 1n;
      bits.push(Number(bit) as Bit);
    }

    return bits;
  }

  /**
   * Converts the field value to an array of bits in big-endian order.
   *
   * @param length - The number of bits to extract
   * @returns An array of bits (0 or 1) in big-endian order
   * @throws Error if length is negative or exceeds Field.MAX_BIT_SIZE or if length is less than the minimum required bits to represent the value
   */
  toBeBits<N extends number>(length: N): Bit[] {
    const minLengthRequired =
      this.value === 0n ? 0 : Math.ceil(Number(this.log2(this.value)) + 1);
    if (length < minLengthRequired || length > Field.MAX_BIT_SIZE) {
      throw new Error(
        `Length must be between ${minLengthRequired} and ${Field.MAX_BIT_SIZE}`
      );
    }

    const bits: Bit[] = [];
    for (let i = length - 1; i >= 0; i--) {
      const bit = (this.value >> BigInt(i)) & 1n;
      bits.push(Number(bit) as Bit);
    }

    return bits;
  }

  /**
   * Converts the field value to an array of bytes in little-endian order.
   *
   * @param length - The number of bytes to extract
   * @returns An array of bytes in little-endian order
   * @throws Error if length is negative or exceeds Field.MAX_BIT_SIZE or if length is less than the minimum required bytes to represent the value
   */
  toLeBytes<N extends number>(length: N): number[] {
    const minLengthRequired = Math.ceil(this.value.toString(2).length / 8);
    if (length < minLengthRequired || length > Field.modLeBytes().length) {
      throw new Error(
        `Length must be between ${minLengthRequired} and ${Field.modLeBytes().length}`
      );
    }
    const bytes: number[] = [];

    for (let i = 0; i < length; i++) {
      const byte = Number((this.value >> BigInt(8 * i)) & 0xffn);
      bytes.push(byte);
    }

    return bytes;
  }

  /**
   * Converts the field value to an array of bytes in big-endian order.
   *
   * @param length - The number of bytes to extract
   * @returns An array of bytes in big-endian order, sized by the length parameter
   * @throws Error if length is negative, or exceeds maximum bit size or if length is less than the minimum required bytes to represent the value
   */
  toBeBytes<N extends number>(length: N): number[] {
    const minLengthRequired = Math.ceil(this.value.toString(2).length / 8);
    if (length < minLengthRequired || length > Field.modBeBytes().length) {
      throw new Error(
        `Length must be between ${minLengthRequired} and ${Field.modBeBytes().length}`
      );
    }
    const bytes: number[] = [];

    for (let i = length - 1; i >= 0; i--) {
      const byte = Number((this.value >> BigInt(8 * i)) & 0xffn);
      bytes.push(byte);
    }

    return bytes;
  }

  /**
   * Calculates the minimum length needed to represent a value in a given radix, rounded up to the nearest power of 2.
   *
   * This function is used internally to determine the minimum number of digits required to represent
   * a field value in a given base (radix). The result is always rounded up to the nearest power of 2
   * to ensure consistent sizing for cryptographic operations.
   *
   * @param value - The bigint value to calculate the representation length for
   * @param radix - The base to represent the value in (must be a power of 2)
   * @returns The minimum number of digits needed to represent the value in the given radix, rounded up to the nearest power of 2
   * @throws {Error} If the value is negative
   * @throws {Error} If the radix is not a power of 2
   * @throws {Error} If the radix is less than 2
   */
  private minRadixLength(value: bigint, radix: number): number {
    if (value < 0n) throw new Error('value must be non-negative');
    if ((radix & (radix - 1)) !== 0)
      throw new Error('radix must be a power of 2');
    if (radix < 2) throw new Error('radix must be >= 2');

    if (value === 0n) return 1;

    // Compute log2(radix)
    let radixBits = 0;
    let r = radix;
    while ((r >>= 1) > 0) {
      radixBits++;
    }

    // Count how many bits are needed to represent the value
    let bits = 0;
    let v = value;
    while (v > 0n) {
      v >>= 1n;
      bits++;
    }

    // Compute minimum number of radix digits
    const rawLen = Math.ceil(bits / radixBits);

    // Round up to the nearest power of 2
    let rounded = 1;
    while (rounded < rawLen) {
      rounded <<= 1;
    }

    return rounded;
  }

  /**
   * Converts the field value to an array of digits in little-endian order using the specified radix.
   *
   * @param radix - The base to use for conversion
   * @param length - The number of digits to extract
   * @returns An array of digits in little-endian order
   * @throws Error if radix is invalid or length is negative or if length is less than the minimum required digits to represent the value, or if length is greater than 256
   */
  toLeRadix(radix: number, length: number): number[] {
    const minimumRequired = this.minRadixLength(this.value, radix);
    if (length < minimumRequired || length > 256) {
      throw new Error(`Length must be between ${minimumRequired} and 256`);
    }

    const r = BigInt(radix);
    const digits: number[] = [];

    let v = this.value;
    for (let i = 0; i < length; i++) {
      digits.push(Number(v % r));
      v /= r;
    }

    // Pad with zeroes if needed
    while (digits.length < length) digits.push(0);

    return digits;
  }

  /**
   * Converts the field value to an array of digits in big-endian order using the specified radix.
   *
   * @param radix - The base to use for conversion (must be a power of 2 between 2 and 256)
   * @param length - The number of digits to extract
   * @returns An array of digits in big-endian order
   * @throws Error if radix is invalid or length is negative or if length is less than the minimum required digits to represent the value, or if length is greater than 256
   */
  toBeRadix(radix: number, length: number): number[] {
    const minimumRequired = this.minRadixLength(this.value, radix);
    if (length < minimumRequired || length > 256) {
      throw new Error(`Length must be between ${minimumRequired} and 256`);
    }

    const r = BigInt(radix);
    const digits: number[] = [];

    let v = this.value;
    for (let i = 0; i < length; i++) {
      digits.push(Number(v % r));
      v /= r;
    }

    // Pad with leading zeroes if needed, then reverse for BE
    while (digits.length < length) digits.push(0);

    return digits.reverse();
  }

  /**
   * Raises the field value to the specified power.
   *
   * @param exponent - The power to raise to
   * @returns A new Field instance with the result
   * @throws Error if exponent is negative or greater than equal to 2^32
   */
  pow32(exponent: this): Field {
    const exp = exponent.value;
    const MAX_EXP = BigInt(2 ** 32);
    if (exp < 0n)
      // Noir only supports exponents < 2^32
      throw new Error('Negative exponents are not allowed');
    if (exp >= MAX_EXP)
      throw new Error('Exponent too large: exceeds 2^32 limit');

    let result = 1n;
    let b = this.value % Field.MODULUS;
    let e = exp;

    while (e > 0n) {
      if (e & 1n) {
        result = (result * b) % Field.MODULUS;
      }
      b = (b * b) % Field.MODULUS;
      e >>= 1n;
    }

    return new Field(result);
  }

  /**
   * Asserts that the field value does not exceed the specified bit size.
   *
   * @param bitSize - The maximum allowed bit size
   * @throws Error if the field value exceeds the specified bit size
   */
  assertMaxBitSize(bitSize: number): void {
    if (this.value < 0n) {
      throw new Error('Negative field values are not allowed');
    }

    let bitLength = 0;
    let v = this.value;

    while (v > 0n) {
      v >>= 1n;
      bitLength++;
    }

    if (bitLength > bitSize) {
      throw new Error(`Field value exceeds ${bitSize} bits`);
    }
  }

  /**
   * Returns the sign of the field value (0 or 1).
   * This is used in cryptographic operations to determine the sign of a field element.
   *
   * @returns 0 if the value is even, 1 if odd
   */
  sgn0(): Bit {
    return Number(this.value & 1n) as Bit;
  }

  /**
   * Returns a string representation of the field value.
   *
   * @returns The field value as a decimal string
   */
  toString(): string {
    return this.value.toString(10);
  }

  /**
   * Converts the field value to a hexadecimal string.
   *
   * @param length - Optional length in bytes to pad the hex string to
   * @returns The field value as a hexadecimal string with '0x' prefix
   */
  toHex(): string {
    const hex = this.value.toString(16);
    return `0x${hex}`;
  }

  /**
   * Converts the field value to its Circuit Input representation.
   * Returns the field value as a hexadecimal string.
   *
   */
  toCircuitInputs(): string {
    return this.toHex();
  }

  /**
   * Checks if this field value equals another value.
   *
   * @param other - The value to compare against (can be Field, number, string, or bigint)
   * @returns true if the values are equal
   */
  equals(other: Field | number | string | bigint): boolean {
    if (other instanceof Field) {
      return this.value === other.value;
    }
    return this.value === BigInt(other);
  }

  /**
   * Adds another value to this field value.
   *
   * @param input - The value to add (can be Field, number, string, or bigint)
   * @returns A new Field instance with the sum
   */
  add(input: Field | number | string | bigint): Field {
    const rhs = input instanceof Field ? input.value : BigInt(input);
    const sum = this.value + rhs;
    const reduced = sum >= Field.MODULUS ? sum - Field.MODULUS : sum;

    return new Field(reduced);
  }

  /**
   * Subtracts another value from this field value.
   *
   * @param input - The value to subtract (can be Field, number, string, or bigint)
   * @returns A new Field instance with the difference
   */
  sub(input: Field | number | string | bigint): Field {
    const otherField = input instanceof Field ? input : new Field(input);
    const res = (this.value - otherField.value + Field.MODULUS) % Field.MODULUS;
    return new Field(res);
  }

  /**
   * Multiplies this field value by another value.
   *
   * @param input - The value to multiply by (can be Field, number, string, or bigint)
   * @returns A new Field instance with the product
   */
  mul(input: Field | number | string | bigint): Field {
    const otherField = input instanceof Field ? input : new Field(input);
    return new Field((this.value * otherField.value) % Field.MODULUS);
  }

  /**
   * Computes the modular inverse of a field element.
   *
   * @param a - The field element to compute the inverse of
   * @param mod - The modulus to use for the computation
   *
   * @returns The modular inverse of the field element
   */
  private modInv(a: bigint, mod: bigint): bigint {
    let t = 0n;
    let newT = 1n;
    let r = mod;
    let newR = a;

    while (newR !== 0n) {
      const quotient = r / newR;
      [t, newT] = [newT, t - quotient * newT];
      [r, newR] = [newR, r - quotient * newR];
    }

    if (r > 1n) throw new Error('Input is not invertible');
    if (t < 0n) t += mod;

    return t;
  }

  /**
   * Divides this field value by another value.
   *
   * @param input - The value to divide by (can be Field, number, string, or bigint)
   * @returns A new Field instance with the quotient
   * @throws Error if dividing by zero
   */
  div(input: Field | number | string | bigint): Field {
    const otherField = input instanceof Field ? input : new Field(input);

    if (otherField.value === 0n) {
      throw new Error('Division by zero');
    }

    // Compute modular inverse of divisor
    const inv = this.modInv(otherField.value, Field.MODULUS);
    const result = (this.value * inv) % Field.MODULUS;

    return new Field(result);
  }

  /**
   * Computes the remainder of division of this field value by another value.
   *
   * @param input - The value to divide by (can be Field, number, string, or bigint)
   * @returns A new Field instance with the remainder
   * @throws Error if dividing by zero
   */
  mod(input: Field | number | string | bigint): Field {
    const rhs = input instanceof Field ? input.value : new Field(input).value;

    if (rhs === 0n) {
      throw new Error('Cannot modulo by zero');
    }
    const result = ((this.value % rhs) + rhs) % rhs;
    return new Field(result);
  }

  /**
   * Creates a copy of this field value.
   *
   * @returns A new Field instance with the same value
   */
  clone(): Field {
    return new Field(this.value);
  }

  static modBeBits(): Bit[] {
    return [
      1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1,
      1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0,
      0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0,
      1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0,
      0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0,
      1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1,
      1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1,
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1,
    ];
  }

  static modBeBytes(): number[] {
    return [
      48, 100, 78, 114, 225, 49, 160, 41, 184, 80, 69, 182, 129, 129, 88, 93,
      40, 51, 232, 72, 121, 185, 112, 145, 67, 225, 245, 147, 240, 0, 0, 1,
    ];
  }

  static modLeBits(): Bit[] {
    return [
      1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0,
      0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0,
      0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1,
      0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0,
      1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0,
      0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1,
      0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0,
      0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0,
      1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0,
      0, 0, 1, 1,
    ];
  }

  static modLeBytes(): number[] {
    return [
      1, 0, 0, 240, 147, 245, 225, 67, 145, 112, 185, 121, 72, 232, 51, 40, 93,
      88, 129, 129, 182, 69, 80, 184, 41, 160, 49, 225, 114, 78, 100, 48,
    ];
  }

  static modNumBits(): bigint {
    return Field.MAX_BIT_SIZE;
  }
}
