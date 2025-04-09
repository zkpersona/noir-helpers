---
"@zkpersona/noir-helpers": minor
---

# Data Types

This release adds set of Data-types that resemble Noir Language Data types. The following data-types are included:

- Field
- Signed/Unsigned Integers
- bool
- str
- arrays
- BoundedVec

Example Usage:

```ts
import {
  Bool,
  BoundedVec,
  Field,
  FixedSizeArray,
  I8,
  Str,
  U8,
  toJSON,
} from '@zkpersona/noir-helpers';

const a = new Field(1); // Field element
const b = new Field('0x10'); // Hex Representation

// Initialize BoundedVec with MaxLength and default value factory.
const c = new BoundedVec(2, () => new Field(0)); // BoundedVec<Field,2>;

// struct A {
//     x: Field,
//     y: Field,
// }

// BoundedVec<A, 2>;
const d = new BoundedVec(2, () => ({
  x: new Field(0),
  y: new Field(0),
}));

// bool
const e = new Bool(true);
// str
const f = new Str('hello');
// u8
const g = new U8(12);
// i8
const h = new I8(12);

// BoundedVec<[u8;2],2>
const ele = () =>
  new BoundedVec(2, () => new FixedSizeArray(2, [new U8(0), new U8(0)]));

const updatedEle = ele();
updatedEle.push(new FixedSizeArray(2, [new U8(1), new U8(2)]));

const i = new BoundedVec(2, () => ({
  x: ele(),
}));

i.push({ x: updatedEle });
console.log(
  toJSON({
    a,
    b,
    c,
    d,
    e,
    f,
    g,
    h,
    i,
  })
);
```


This outputs the following JSON object:

<details>
<summary>Output</summary>

```json
{
  "a": "0x0000000000000000000000000000000000000000000000000000000000000001",
  "b": "0x0000000000000000000000000000000000000000000000000000000000000010",
  "c": {
    "storage": [
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    ],
    "len": 0
  },
  "d": {
    "storage": [
      {
        "x": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "y": "0x0000000000000000000000000000000000000000000000000000000000000000"
      },
      {
        "x": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "y": "0x0000000000000000000000000000000000000000000000000000000000000000"
      }
    ],
    "len": 0
  },
  "e": true,
  "f": "hello",
  "g": "12",
  "h": "12",
  "i": {
    "storage": [
      {
        "x": {
          "storage": [
            ["1","2"],
            ["0","0"]
          ],
          "len": 1
        }
      },
      {
        "x": {
          "storage": [
            ["0","0"],
            ["0","0"]
          ],
          "len": 0
        }
      }
    ],
    "len": 1
  }
}
```

</details>

This is particularly useful for generating `Prover.toml` files for Circuit Inputs, when combined with `toJSON` and `generateToml` functions.