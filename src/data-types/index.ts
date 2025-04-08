import { FixedSizeArray } from './array';
import { Bool } from './bool';
import { BoundedVec } from './bounded-vec';
import { Field } from './field';
import { AbstractInteger } from './integer';
import { Str } from './string';

export type DataType =
  | Field
  | Bool
  | Str
  | BoundedVec<DataType>
  | FixedSizeArray<DataType>
  | StructMap;

export type StructMap = {
  [key: string]: DataType;
};

export function toJSON(value: DataType): object | string | boolean {
  if (value instanceof AbstractInteger) {
    return value.toString();
  }
  if (value instanceof Bool) {
    return value.toJSON();
  }
  if (value instanceof Str) {
    return value.toJSON();
  }
  if (value instanceof Field) {
    return value.toHex();
  }
  if (value instanceof BoundedVec) {
    return value.toJSON();
  }

  if (value instanceof FixedSizeArray) {
    return value.toJSON();
  }

  // Recursively process the properties of the object
  if (typeof value === 'object' && value !== null) {
    // If the value is a StructMap (an object), recursively process its properties
    const result: { [key: string]: string | object | boolean } = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = toJSON(val);
    }
    return result;
  }
  throw new Error(
    `Invalid value type: ${value === null ? 'null' : typeof value}`
  );
}

export * from './field';
export * from './integer';
export * from './bool';
export * from './string';
export * from './array';
export * from './bounded-vec';

export * from './zod';
