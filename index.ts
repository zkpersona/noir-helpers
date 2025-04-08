import { FixedSizeArray } from '~/data-types/array';
import { U8, toJSON } from './src/data-types';
import { BoundedVec } from './src/data-types/bounded-vec';
import { Field } from './src/data-types/field';

type Struct = {
  a: Field;
  b: BoundedVec<Field>;
};
type A = {
  x: Field;
  y: BoundedVec<Struct>;
  z: FixedSizeArray<Field>;
  w: U8;
};

const data: A = {
  x: new Field(1),
  y: new BoundedVec<Struct>(1, () => ({
    a: new Field(1),
    b: new BoundedVec<Field>(2, () => new Field(0)),
  })),
  z: new FixedSizeArray(2, [new Field(1), new Field(2)]),
  w: new U8(1),
};
console.log(JSON.stringify(toJSON(data), null, 2));
