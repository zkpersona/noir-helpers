import { type DataType, toJSON } from '.';

/**
 * A fixed-size array implementation that stores elements of a specific data type.
 * This class provides type-safe access to array elements and ensures the array size
 * remains constant throughout its lifetime.
 *
 * @template T - The type of elements stored in the array, must extend DataType
 */
export class FixedSizeArray<T extends DataType> {
  /** The fixed length of the array */
  protected length: number;
  /** Internal storage for array elements */
  protected items: T[];

  /**
   * Creates a new fixed-size array with the specified length and initial items.
   *
   * @param length - The fixed length of the array
   * @param items - Initial items to populate the array
   * @throws {Error} If the length parameter doesn't match the number of items provided
   */
  constructor(length: number, items: T[]) {
    if (length !== items.length) {
      throw new Error('Length mismatch');
    }
    this.length = length;
    this.items = items;
  }

  /**
   * Returns the fixed length of the array.
   *
   * @returns The number of elements in the array
   */
  len(): number {
    return this.length;
  }

  /**
   * Returns the internal storage array containing all elements.
   * Note: This returns a reference to the internal array, modifications to the
   * returned array will affect the original storage.
   *
   * @returns The internal array containing all elements
   */
  storage(): T[] {
    return this.items;
  }

  /**
   * Retrieves the element at the specified index.
   *
   * @param index - The zero-based index of the element to retrieve
   * @returns The element at the specified index
   * @throws {Error} If the index is out of bounds (index >= length)
   */
  get(index: number): T {
    if (index >= this.length) {
      throw new Error('Index out of bounds');
    }
    return this.items[index];
  }

  /**
   * Sets the element at the specified index to the given value.
   *
   * @param index - The zero-based index where the element should be set
   * @param item - The new value to set at the specified index
   * @throws {Error} If the index is out of bounds (index >= length)
   */
  set(index: number, item: T): void {
    if (index >= this.length) {
      throw new Error('Index out of bounds');
    }
    this.items[index] = item;
  }

  /**
   * Converts the array to a JSON representation.
   * Each element is converted to its JSON form using the toJSON function.
   *
   * @returns An array containing the JSON representation of each element
   */
  toJSON(): (string | object)[] {
    const res = [];
    for (const item of this.items) {
      res.push(toJSON(item));
    }
    return res;
  }
}
