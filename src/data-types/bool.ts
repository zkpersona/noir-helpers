/**
 * A boolean value type that provides type-safe boolean operations and serialization.
 * This class wraps a primitive boolean value and provides methods for boolean algebra
 * and comparison operations.
 */
export class Bool {
  /** The underlying boolean value */
  private readonly val: boolean;

  /**
   * Creates a new boolean instance with the specified value.
   *
   * @param value - The boolean value to initialize the instance with
   */
  constructor(value: boolean) {
    this.val = value;
  }

  /**
   * Returns the underlying boolean value.
   *
   * @returns The boolean value
   */
  value(): boolean {
    return this.val;
  }

  /**
   * Compares this boolean with another for equality.
   *
   * @param other - The boolean to compare with
   * @returns true if both booleans have the same value, false otherwise
   */
  eq(other: Bool): boolean {
    return this.val === other.val;
  }

  /**
   * Performs a logical NOT operation on this boolean.
   * Returns a new boolean instance with the negated value.
   *
   * @returns A new boolean instance with the opposite value
   */
  not(): Bool {
    return new Bool(!this.val);
  }

  /**
   * Converts the boolean to its JSON representation.
   * Returns the underlying primitive boolean value.
   *
   * @returns The boolean value as a primitive
   */
  toJSON(): boolean {
    return this.val;
  }
}
