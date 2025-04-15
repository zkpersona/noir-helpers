import type { InputValue } from '~/types';
import { type DataType, getInputRepresentation } from '.';

export class FixedSizeArray<T extends DataType, N extends number> {
  private readonly length: number;
  private items: T[];

  constructor(length: N, items: T[]) {
    if (length !== items.length) {
      throw new Error(
        `Length mismatch: expected ${length}, got ${items.length}`
      );
    }
    this.length = length;
    this.items = [...items];
  }

  len(): number {
    return this.length;
  }

  toArray(): T[] {
    return [...this.items];
  }

  get(index: number): T {
    if (index < 0 || index >= this.length) {
      throw new Error(`Index ${index} out of bounds`);
    }
    return this.items[index];
  }

  at(index: number): T {
    const adjustedIndex = index < 0 ? this.length + index : index;
    return this.get(adjustedIndex);
  }

  set(index: number, item: T): void {
    if (index < 0 || index >= this.length) {
      throw new Error(`Index ${index} out of bounds`);
    }
    this.items[index] = item;
  }

  forEach(callback: (item: T, index: number) => void): void {
    this.items.forEach(callback);
  }

  map<U>(callback: (item: T, index: number) => U): U[] {
    return this.items.map(callback);
  }

  toCircuitInputs() {
    return this.items.map(getInputRepresentation) satisfies InputValue;
  }
}
