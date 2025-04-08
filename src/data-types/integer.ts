import { Field } from './field';
import { IntegerValidator } from './zod';
import type { IntegerInput } from './zod/index';

/**
 * Abstract base class for all integer types with fixed bit-widths.
 * Provides common functionality for arithmetic operations and value validation.
 *
 * @template T - The concrete integer type extending this class
 */
export abstract class AbstractInteger extends Field {
  /** Maximum value that can be represented by this integer type */
  protected static MAX_VALUE: bigint;
  /** Minimum value that can be represented by this integer type */
  protected static MIN_VALUE: bigint;

  /**
   * Gets the minimum value that can be represented by this integer type.
   * @returns The minimum value as a bigint
   */
  protected min(): bigint {
    return (this.constructor as typeof AbstractInteger).MIN_VALUE;
  }

  /**
   * Gets the maximum value that can be represented by this integer type.
   * @returns The maximum value as a bigint
   */
  protected max(): bigint {
    return (this.constructor as typeof AbstractInteger).MAX_VALUE;
  }

  /**
   * Creates a new instance of the concrete integer type.
   * @param value - The value to initialize the new instance with
   * @returns A new instance of the concrete integer type
   */
  protected newInstance(value: IntegerInput | Field): this {
    const ConcreteClass = Object.getPrototypeOf(this).constructor;
    if (value instanceof Field) {
      return new ConcreteClass(value.value);
    }
    return new ConcreteClass(value);
  }

  /**
   * Constructs a new integer instance with the given value.
   * Validates that the input value is within the allowed range.
   * @param input - The value to initialize this integer with
   * @throws {ZodError} If the input value is outside the allowed range
   */
  constructor(input: IntegerInput) {
    super(input);
    const min = (this.constructor as typeof AbstractInteger).MIN_VALUE;
    const max = (this.constructor as typeof AbstractInteger).MAX_VALUE;
    IntegerValidator(min, max).parse(input);
  }

  /**
   * Adds another integer to this one with overflow checking.
   * @param other - The integer to add
   * @returns A new integer representing the sum
   * @throws {Error} If the result would overflow
   */
  override add(other: this | IntegerInput): this {
    return this.newInstance(super.add(other));
  }

  /**
   * Subtracts another integer from this one with overflow checking.
   * @param other - The integer to subtract
   * @returns A new integer representing the difference
   * @throws {Error} If the result would overflow
   */
  override sub(other: this | IntegerInput): this {
    return this.newInstance(super.sub(other));
  }

  /**
   * Multiplies this integer by another with overflow checking.
   * @param other - The integer to multiply by
   * @returns A new integer representing the product
   * @throws {Error} If the result would overflow
   */
  override mul(other: this | IntegerInput): this {
    return this.newInstance(super.mul(other));
  }

  /**
   * Divides this integer by another with overflow checking.
   * @param other - The integer to divide by
   * @returns A new integer representing the quotient
   * @throws {Error} If the result would overflow or if dividing by zero
   */
  override div(other: this | IntegerInput): this {
    return this.newInstance(super.div(other));
  }

  /**
   * Computes the remainder of dividing this integer by another.
   * @param other - The integer to divide by
   * @returns A new integer representing the remainder
   * @throws {Error} If dividing by zero
   */
  override mod(other: this | IntegerInput): this {
    return super.mod(other) as this;
  }

  /**
   * Performs wrapping addition of two integers.
   * If the result would overflow, it wraps around to the minimum value.
   * @param other - The integer to add
   * @returns A new integer representing the wrapped sum
   */
  wrappingAdd(other: this): this {
    const min = this.min();
    const max = this.max();
    const range = max - min + 1n;

    const a = this.value - min;
    const b = other.value - min;

    const mask = range - 1n;
    const sum = (a + b) & mask;

    return this.newInstance(sum + min);
  }

  /**
   * Performs wrapping subtraction of two integers.
   * If the result would underflow, it wraps around to the maximum value.
   * @param other - The integer to subtract
   * @returns A new integer representing the wrapped difference
   */
  wrappingSub(other: this): this {
    const min = this.min();
    const max = this.max();
    const range = max - min + 1n;

    const a = this.value - min;
    const b = other.value - min;

    const mask = range - 1n;
    const diff = (a - b) & mask;

    return this.newInstance(diff + min);
  }

  /**
   * Performs wrapping multiplication of two integers.
   * If the result would overflow, it wraps around to the minimum value.
   * @param other - The integer to multiply by
   * @returns A new integer representing the wrapped product
   */
  wrappingMul(other: this): this {
    const min = this.min();
    const max = this.max();
    const range = max - min + 1n;

    const a = this.value - min;
    const b = other.value - min;

    const mask = range - 1n;
    const prod = (a * b) & mask;

    return this.newInstance(prod + min);
  }
}

/**
 * 8-bit unsigned integer type.
 * Range: 0 to 255
 */
export class U8 extends AbstractInteger {
  protected static override MAX_VALUE = 255n;
  protected static override MIN_VALUE = 0n;
}

/**
 * 16-bit unsigned integer type.
 * Range: 0 to 65,535
 */
export class U16 extends AbstractInteger {
  protected static override MAX_VALUE = 65535n;
  protected static override MIN_VALUE = 0n;
}

/**
 * 32-bit unsigned integer type.
 * Range: 0 to 4,294,967,295
 */
export class U32 extends AbstractInteger {
  protected static override MAX_VALUE = 4294967295n;
  protected static override MIN_VALUE = 0n;
}

/**
 * 64-bit unsigned integer type.
 * Range: 0 to 18,446,744,073,709,551,615
 */
export class U64 extends AbstractInteger {
  protected static override MAX_VALUE = 18446744073709551615n;
  protected static override MIN_VALUE = 0n;
}

/**
 * 8-bit signed integer type.
 * Range: -128 to 127
 */
export class I8 extends AbstractInteger {
  protected static override MAX_VALUE = 127n;
  protected static override MIN_VALUE = -128n;
}

/**
 * 16-bit signed integer type.
 * Range: -32,768 to 32,767
 */
export class I16 extends AbstractInteger {
  protected static override MAX_VALUE = 32767n;
  protected static override MIN_VALUE = -32768n;
}

/**
 * 32-bit signed integer type.
 * Range: -2,147,483,648 to 2,147,483,647
 */
export class I32 extends AbstractInteger {
  protected static override MAX_VALUE = 2147483647n;
  protected static override MIN_VALUE = -2147483648n;
}

/**
 * 64-bit signed integer type.
 * Range: -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807
 */
export class I64 extends AbstractInteger {
  protected static override MAX_VALUE = 9223372036854775807n;
  protected static override MIN_VALUE = -9223372036854775808n;
}
