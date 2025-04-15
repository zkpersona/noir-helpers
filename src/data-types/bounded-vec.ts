import type { InputValue } from '~/types';
import { type DataType, getInputRepresentation } from '.';

/**
 * A bounded vector implementation that maintains a fixed maximum capacity
 * while allowing dynamic growth up to that capacity. This class provides
 * a type-safe, resizable array-like structure with a strict upper bound
 * on the number of elements it can contain.
 *
 * @template T - The type of elements stored in the vector, must extend DataType
 * @template N - The type of the maximum size of the vector, must extend number
 */
export class BoundedVec<T extends DataType, N extends number> {
  /** Maximum number of elements the vector can hold */
  private readonly maxSize: number;
  /** Current number of elements in the vector */
  private length: number;
  /** Internal storage for vector elements */
  private items: T[];

  /**
   * Creates a new bounded vector with the specified maximum size.
   * The vector is initialized with default values up to the maximum size.
   *
   * @param maxSize - The maximum number of elements the vector can hold
   * @param defaultValue - Default value for initialization
   * @param initialItems - Initial items to add to the vector
   * @throws {Error} If maxSize is negative
   */
  constructor(maxSize: N, defaultValue: T, initialItems: T[] = []) {
    if (maxSize < 0) {
      throw new Error('Max size must be non-negative');
    }
    this.maxSize = maxSize;
    this.items = Array.from({ length: maxSize }, () => defaultValue);
    this.length = 0;
    this.extendFromArray(initialItems);
  }

  /**
   * Returns the current number of elements in the vector.
   *
   * @returns The number of elements currently stored in the vector
   */
  len(): number {
    return this.length;
  }

  /**
   * Returns the maximum number of elements the vector can hold.
   *
   * @returns The maximum capacity of the vector
   */
  maxLen(): number {
    return this.maxSize;
  }

  /**
   * Checks if the vector is empty.
   *
   * @returns true if the vector contains no elements, false otherwise
   */
  private isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Checks if the vector has reached its maximum capacity.
   *
   * @returns true if the vector is at maximum capacity, false otherwise
   */
  private isFull(): boolean {
    return this.length === this.maxSize;
  }

  /**
   * Returns the internal storage for the vector.
   */
  storage(): T[] {
    return this.items;
  }

  /**
   * Retrieves the element at the specified index.
   *
   * @param index - The zero-based index of the element to retrieve
   * @returns The element at the specified index
   * @throws {Error} If the index is out of bounds (index < 0 or index >= length)
   */
  get(index: number): T {
    if (index < 0 || index >= this.length) {
      throw new Error('Index out of bounds');
    }
    return this.items[index];
  }

  /**
   * Retrieves the element at the specified index, supporting negative indices.
   * Negative indices count from the end of the vector (-1 is the last element).
   *
   * @param index - The index of the element to retrieve (can be negative)
   * @returns The element at the specified index
   * @throws {Error} If the index is out of bounds after adjustment
   */
  at(index: number): T {
    const adjustedIndex = index < 0 ? this.length + index : index;
    return this.get(adjustedIndex);
  }

  /**
   * Adds an element to the end of the vector.
   *
   * @param item - The element to add to the vector
   * @throws {Error} If the vector is at maximum capacity
   */
  push(item: T): void {
    if (this.isFull()) {
      throw new Error('Vector is full');
    }
    this.items[this.length] = item;
    this.length++;
  }

  /**
   * Sets the element at the specified index to the given value.
   *
   * @param index - The zero-based index where the element should be set
   * @param item - The new value to set at the specified index
   * @throws {Error} If the index is out of bounds (index < 0 or index >= length)
   */
  set(index: number, item: T): void {
    if (index < 0 || index >= this.length) {
      throw new Error('Index out of bounds');
    }
    this.items[index] = item;
  }

  /**
   * Removes and returns the last element of the vector.
   *
   * @returns The last element of the vector
   * @throws {Error} If the vector is empty
   */
  pop(): T {
    if (this.isEmpty()) {
      throw new Error('Vector is empty');
    }
    const item = this.items[this.length - 1];
    this.length--;
    return item;
  }

  /**
   * Extends the vector by adding all elements from the given array.
   *
   * @param arr - The array of elements to add to the vector
   * @throws {Error} If adding the elements would exceed the vector's maximum capacity
   */
  extendFromArray(arr: T[]): void {
    if (this.length + arr.length > this.maxSize) {
      throw new Error('Vector overflow');
    }
    for (const item of arr) {
      this.push(item);
    }
  }

  /**
   * Extends the vector by adding all elements from another bounded vector.
   *
   * @param vec - The bounded vector whose elements should be added
   * @throws {Error} If adding the elements would exceed the vector's maximum capacity
   */
  extendFromVec(vec: BoundedVec<T, N>): void {
    this.extendFromArray(vec.toArray());
  }

  /**
   * Returns a copy of the vector's elements as an array.
   * Only includes elements up to the current length.
   *
   * @returns An array containing the vector's elements
   */
  private toArray(): T[] {
    return this.items.slice(0, this.length);
  }

  /**
   * Converts the BoundedVec to a Circuit Input representation.
   * The JSON object contains both the elements and the current length.
   *
   * @returns Noir Circuit Input representation of the BoundedVec
   */
  toCircuitInputs(): {
    storage: InputValue[];
    len: number;
  } {
    return {
      storage: this.storage().map((item) => getInputRepresentation(item)),
      len: this.length,
    };
  }
}
