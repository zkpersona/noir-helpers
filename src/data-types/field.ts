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
  private readonly value: bigint;

  /** The maximum bit size of a Field */
  static readonly MAX_BIT_SIZE = 254n;

  /** The maximum value that can be represented by a Field */
  static readonly MAX_VALUE = 2n ** Field.MAX_BIT_SIZE - 1n;

  /**
   * Creates a new Field instance from various input types.
   *
   * @param input - The input value to convert to a field element
   * @throws Error if the input cannot be parsed as a valid field value
   */
  constructor(input: FieldInput) {
    const parsed = FieldValidator.parse(input);
    this.value = parsed;
  }

  /**
   * Converts the field value to an array of bits in little-endian order.
   *
   * @param length - The number of bits to extract
   * @returns An array of bits (0 or 1) in little-endian order
   * @throws Error if length is negative
   */
  toLeBits<N extends number>(length: N): Bit[] {
    const bits: Bit[] = [];
    for (let i = 0; i < length; i++) {
      bits.push(Number((this.value >> BigInt(i)) & 1n) as Bit);
    }
    return bits;
  }

  /**
   * Converts the field value to an array of bits in big-endian order.
   *
   * @param length - The number of bits to extract
   * @returns An array of bits (0 or 1) in big-endian order
   * @throws Error if length is negative
   */
  toBeBits<N extends number>(length: N): Bit[] {
    const bits: Bit[] = [];
    const binary = this.value.toString(2).padStart(length, '0');
    for (let i = 0; i < length; i++) {
      bits.push(i < binary.length ? (Number(binary.at(1 + i)) as Bit) : 0);
    }
    return bits.reverse();
  }

  /**
   * Converts the field value to an array of bytes in little-endian order.
   *
   * @param length - The number of bytes to extract
   * @returns An array of bytes (0-255) in little-endian order
   * @throws Error if length is negative
   */
  toLeBytes<N extends number>(length: N): number[] {
    const bytes: number[] = [];
    let val = this.value;
    for (let i = 0; i < length; i++) {
      bytes.push(Number(val & 0xffn));
      val >>= 8n;
    }
    return bytes;
  }

  /**
   * Converts the field value to an array of bytes in big-endian order.
   *
   * @param length - The number of bytes to extract
   * @returns An array of bytes (0-255) in big-endian order
   * @throws Error if length is negative
   */
  toBeBytes<N extends number>(length: N): number[] {
    const bytes: number[] = [];
    let val = this.value;
    const totalBytes = Math.ceil(val.toString(16).length / 2);
    for (let i = 0; i < totalBytes; i++) {
      bytes.unshift(Number(val & 0xffn));
      val >>= 8n;
    }
    while (bytes.length < length) bytes.unshift(0);
    return bytes.slice(-length);
  }

  /**
   * Converts the field value to an array of digits in little-endian order using the specified radix.
   *
   * @param radix - The base to use for conversion (must be a power of 2 between 2 and 256)
   * @param length - The number of digits to extract
   * @returns An array of digits in little-endian order
   * @throws Error if radix is invalid or length is negative
   */
  toLeRadix(radix: number, length: number): number[] {
    this.validateRadix(radix);
    const digits: number[] = [];
    let val = this.value;
    const mask = BigInt(radix - 1);
    const shift = BigInt(Math.log2(radix));

    for (let i = 0; i < length; i++) {
      digits.push(Number(val & mask));
      val >>= shift;
    }
    return digits;
  }

  /**
   * Converts the field value to an array of digits in big-endian order using the specified radix.
   *
   * @param radix - The base to use for conversion (must be a power of 2 between 2 and 256)
   * @param length - The number of digits to extract
   * @returns An array of digits in big-endian order
   * @throws Error if radix is invalid or length is negative
   */
  toBeRadix(radix: number, length: number): number[] {
    this.validateRadix(radix);
    const digits: number[] = [];
    let val = this.value;
    const mask = BigInt(radix - 1);
    const shift = BigInt(Math.log2(radix));

    while (val > 0n) {
      digits.unshift(Number(val & mask));
      val >>= shift;
    }
    while (digits.length < length) digits.unshift(0);
    return digits.slice(-length);
  }

  /**
   * Raises the field value to the specified power.
   *
   * @param exponent - The power to raise to (must be a non-negative safe integer)
   * @returns A new Field instance with the result
   * @throws Error if exponent is negative or not a safe integer
   */
  pow32(exponent: number): Field {
    if (!Number.isSafeInteger(exponent) || exponent < 0) {
      throw new Error('Exponent must be a non-negative safe integer');
    }
    return new Field(this.value ** BigInt(exponent));
  }

  /**
   * Asserts that the field value does not exceed the specified bit size.
   *
   * @param bitSize - The maximum allowed bit size
   * @throws Error if the field value exceeds the specified bit size
   */
  assertMaxBitSize(bitSize: number): void {
    const bitLength = this.value.toString(2).length;
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
    return Number(this.value % 2n) as Bit;
  }

  /**
   * Compares this field value with another to determine if it is less than.
   *
   * @param other - The field to compare against
   * @returns true if this value is less than the other value
   */
  lt(other: Field): boolean {
    return this.value < other.value;
  }

  /**
   * Serializes the field value to a JSON string.
   *
   * @returns The field value as a decimal string
   */
  toJSON(): string {
    return this.value.toString();
  }

  /**
   * Returns a string representation of the field value.
   *
   * @returns The field value as a decimal string
   */
  toString(): string {
    return this.toJSON();
  }

  /**
   * Converts the field value to a hexadecimal string.
   *
   * @param length - Optional length in bytes to pad the hex string to
   * @returns The field value as a hexadecimal string with '0x' prefix
   */
  toHex(length?: number): string {
    let hex = this.value.toString(16);
    if (length) {
      hex = hex.padStart(length * 2, '0');
    }
    return `0x${hex}`;
  }

  /**
   * Checks if this field value equals another value.
   *
   * @param other - The value to compare against (can be Field, number, string, or bigint)
   * @returns true if the values are equal
   */
  equals(other: Field | number | string | bigint): boolean {
    const otherField = other instanceof Field ? other : new Field(other);
    return this.value === otherField.value;
  }

  /**
   * Adds another value to this field value.
   *
   * @param input - The value to add (can be Field, number, string, or bigint)
   * @returns A new Field instance with the sum
   */
  add(input: Field | number | string | bigint): Field {
    const otherField = input instanceof Field ? input : new Field(input);
    return new Field(this.value + otherField.value);
  }

  /**
   * Subtracts another value from this field value.
   *
   * @param input - The value to subtract (can be Field, number, string, or bigint)
   * @returns A new Field instance with the difference
   * @throws Error if the result would be negative
   */
  subtract(input: Field | number | string | bigint): Field {
    const otherField = input instanceof Field ? input : new Field(input);
    if (this.value < otherField.value) {
      throw new Error('Result would be negative');
    }
    return new Field(this.value - otherField.value);
  }

  /**
   * Multiplies this field value by another value.
   *
   * @param input - The value to multiply by (can be Field, number, string, or bigint)
   * @returns A new Field instance with the product
   */
  multiply(input: Field | number | string | bigint): Field {
    const otherField = input instanceof Field ? input : new Field(input);
    return new Field(this.value * otherField.value);
  }

  /**
   * Divides this field value by another value.
   *
   * @param input - The value to divide by (can be Field, number, string, or bigint)
   * @returns A new Field instance with the quotient
   * @throws Error if dividing by zero
   */
  divide(input: Field | number | string | bigint): Field {
    const otherField = input instanceof Field ? input : new Field(input);
    if (otherField.value === 0n) {
      throw new Error('Division by zero');
    }
    return new Field(this.value / otherField.value);
  }

  /**
   * Computes the remainder of division of this field value by another value.
   *
   * @param input - The value to divide by (can be Field, number, string, or bigint)
   * @returns A new Field instance with the remainder
   * @throws Error if dividing by zero
   */
  mod(input: Field | number | string | bigint): Field {
    const otherField = input instanceof Field ? input : new Field(input);
    if (otherField.value === 0n) {
      throw new Error('Modulus by zero');
    }
    return new Field(this.value % otherField.value);
  }

  /**
   * Creates a copy of this field value.
   *
   * @returns A new Field instance with the same value
   */
  clone(): Field {
    return new Field(this.value);
  }

  /**
   * Validates that a radix is a power of 2 between 2 and 256.
   *
   * @param radix - The radix to validate
   * @throws Error if the radix is invalid
   */
  private validateRadix(radix: number): void {
    if (radix <= 1 || radix > 256 || (radix & (radix - 1)) !== 0) {
      throw new Error('Radix must be a power of 2 between 2 and 256');
    }
  }

  /**
   * Creates a Field instance from an array of bytes in little-endian order.
   *
   * @param bytes - The bytes to convert (0-255)
   * @returns A new Field instance
   */
  static fromLeBytes(bytes: number[]): Field {
    let value = 0n;
    for (let i = 0; i < bytes.length; i++) {
      value |= BigInt(bytes[i]) << (8n * BigInt(i));
    }
    return new Field(value);
  }

  /**
   * Creates a Field instance from an array of bytes in big-endian order.
   *
   * @param bytes - The bytes to convert (0-255)
   * @returns A new Field instance
   */
  static fromBeBytes(bytes: number[]): Field {
    let value = 0n;
    for (const byte of bytes) {
      value = (value << 8n) | BigInt(byte);
    }
    return new Field(value);
  }
}
