import { U8 } from './integer';

/**
 * A string value type that provides type-safe string operations and byte conversion.
 * This class wraps a primitive string value and provides methods for string comparison
 * and UTF-8 byte array conversion.
 */
export class Str {
  /** The underlying string value */
  private val: string;

  /**
   * Creates a new string instance with the specified value.
   *
   * @param value - The string value to initialize the instance with
   */
  constructor(value: string) {
    this.val = value;
  }

  /**
   * Returns the underlying string value.
   *
   * @returns The string value
   */
  value(): string {
    return this.val;
  }

  /**
   * Converts the string to an array of UTF-8 encoded bytes.
   * Each byte is represented as a U8 integer value.
   *
   * @returns An array of U8 integers representing the UTF-8 encoded bytes
   */
  asBytes(): U8[] {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(this.val);
    const res: U8[] = [];
    for (const ele of encoded) {
      res.push(new U8(ele));
    }
    return res;
  }

  /**
   * Compares this string with another for equality.
   *
   * @param other - The string to compare with
   * @returns true if both strings have the same value, false otherwise
   */
  eq(other: Str): boolean {
    return this.val === other.val;
  }

  /**
   * Converts the string to its JSON representation.
   * Returns the underlying primitive string value.
   *
   * @returns The string value as a primitive
   */
  toJSON(): string {
    return this.val;
  }
}
