import type { InputMap } from '@noir-lang/noir_js';
import type { InputValue } from '~/types';
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
  | BoundedVec<DataType, number>
  | FixedSizeArray<DataType, number>
  | StructMap;

export type StructMap = {
  [key: string]: DataType;
};

export const getInputRepresentation = (value: DataType): InputValue => {
  if (value instanceof AbstractInteger) {
    return value.toString();
  }
  if (value instanceof Bool) {
    return value.toCircuitInputs();
  }
  if (value instanceof Str) {
    return value.toCircuitInputs();
  }
  if (value instanceof Field) {
    return value.toCircuitInputs();
  }
  if (value instanceof BoundedVec) {
    return value.toCircuitInputs();
  }

  if (value instanceof FixedSizeArray) {
    return value.toCircuitInputs();
  }

  if (typeof value === 'object' && value !== null) {
    const result: InputValue = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = getInputRepresentation(val);
    }
    return result;
  }

  throw new Error(
    `Invalid value type: ${value === null ? 'null' : typeof value}`
  );
};

export function toCircuitInputs(value: StructMap): InputMap {
  return getInputRepresentation(value) as InputMap;
}

export * from './field';
export * from './integer';
export * from './bool';
export * from './string';
export * from './array';
export * from './bounded-vec';

export * from './zod';
