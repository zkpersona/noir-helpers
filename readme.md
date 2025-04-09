# Noir Helpers

Noir Helpers is a collection of utilities and helper function to generate proofs and inputs for noir circuits.

## Installation

To install the `@zkpersona/noir-helpers` package, you can use any of the following package managers:

```bash
npm install @zkpersona/noir-helpers
# or
yarn add @zkpersona/noir-helpers
# or
pnpm add @zkpersona/noir-helpers
# or
bun add @zkpersona/noir-helpers
```

## Usage

### Generating Proofs

The `@zkpersona/noir-helpers` package provides a `Prover` class that can be used to generate proofs for Noir circuits. Here's an example of how to use the `Prover` class:

```typescript
import { Prover , U8, toJSON } from '@zkpersona/noir-helpers';
import type { CompiledCircuit } from '@noir-lang/noir_js';

import circuit from '../target/circuits.json' assert { type: 'json' };

const inputs = { x: new U8(1), y: new U8(2) };
const parsedInputs = toJSON(inputs);

// Supported types are: "plonk", "honk", "all"
const prover = new Prover(circuit as CompiledCircuit, { type: 'plonk' });

// Simulate Witness
const { witness, returnValue } = await prover.simulateWitness(parsedInputs);

// Generate Proof
const proof = await prover.prove(witness);

// Verify Proof
const isValid = await prover.verify(proof);

console.log('Proof verification:', isValid);
```

### Generating `Prover.toml` file

The `@zkpersona/noir-helpers` package also provides a function to generate a `Prover.toml` file from a JSON object. Here's an example of how to use the `generateToml` function:

```typescript
import { generateToml , toJSON, U8 } from '@zkpersona/noir-helpers';

const data = toJSON({ x: new U8(1), y: new U8(2) });
const filePath = 'absolute/path/to/Prover.toml';

generateToml(data, filePath);
```

## Using Data Types

The package exports Noir primitive data types such as Field, Signed/Unsigned Integers, BoundedVec for generating `Prover.toml` Inputs.

Here's an example of how to these data types can be used:

```typescript
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
<br />

Supported types: `Field`, `U1`, `U8`, `U16`, `U32`, `U64`, `I1`, `I8`, `I16`, `I32`, `I64`, `Bool`, `Str`, `FixedArray`.

---

## Getting Started

To get started with the project, clone the repository and install the dependencies:

```bash
git clone https://github.com/zkpersona/noir-helpers.git
cd noir-helpers
pnpm install
```

To run the tests, use the following command:

```bash
pnpm test
```

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---
