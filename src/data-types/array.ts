import { type DataType, getInputRepresentation } from '.';

/**
 * A fixed-size array implementation that maintains a constant length throughout its lifetime.
 * This class provides a type-safe, immutable-length array with bounds checking and
 * common array operations. The internal storage is protected from external modification.
 *
 * @template T - The type of elements stored in the array, must extend DataType
 */
export class FixedSizeArray<T extends DataType> {
  /** The fixed length of the array */
  private readonly length: number;
  /** Internal storage for array elements */
  private items: T[];

  /**
   * Creates a new fixed-size array with the specified length and initial items.
   * The array length is immutable after construction.
   *
   * @param length - The fixed length of the array
   * @param items - Initial items to populate the array
   * @throws {Error} If the length parameter doesn't match the number of items provided
   */
  constructor(length: number, items: T[]) {
    if (length !== items.length) {
      throw new Error(
        `Length mismatch: expected ${length}, got ${items.length}`
      );
    }
    this.length = length;
    this.items = [...items];
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
   * Returns a copy of the array's elements.
   * This method creates a new array to prevent external modification of the internal storage.
   *
   * @returns A new array containing all elements
   */
  toArray(): T[] {
    return [...this.items];
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
      throw new Error(`Index ${index} out of bounds`);
    }
    return this.items[index];
  }

  /**
   * Retrieves the element at the specified index, supporting negative indices.
   * Negative indices count from the end of the array (-1 is the last element).
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
   * Sets the element at the specified index to the given value.
   *
   * @param index - The zero-based index where the element should be set
   * @param item - The new value to set at the specified index
   * @throws {Error} If the index is out of bounds (index < 0 or index >= length)
   */
  set(index: number, item: T): void {
    if (index < 0 || index >= this.length) {
      throw new Error(`Index ${index} out of bounds`);
    }
    this.items[index] = item;
  }

  /**
   * Executes a provided function once for each array element.
   *
   * @param callback - Function to execute for each element, taking the element and its index
   */
  forEach(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback);
  }

  /**
   * Creates a new array populated with the results of calling a provided function
   * on every element in the array.
   *
   * @template U - The type of elements in the resulting array
   * @param callback - Function to execute for each element, taking the element and its index
   * @returns A new array with each element being the result of the callback function
   */
  map<U>(callback: (item: T, index: number) => U): U[] {
    return this.items.map(callback);
  }

  /**
   * Converts the array to a JSON representation.
   * Each element is converted to its JSON form using the toJSON function.
   *
   * @returns An array containing the JSON representation of each element
   */
  toJSON(): ReturnType<typeof getInputRepresentation>[] {
    return this.items.map(getInputRepresentation);
  }
}
