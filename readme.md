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
import { Prover } from '@zkpersona/noir-helpers';
import type { CompiledCircuit } from '@noir-lang/noir_js';

import circuit from '../target/circuits.json' assert { type: 'json' };

const inputs = { x: '1', y: '2' };

// Supported types are: "plonk", "honk", "all"
const prover = new Prover(circuit as CompiledCircuit, { type: 'plonk' });

// Simulate Witness
const { witness, returnValue } = await prover.simulateWitness(inputs);

// Generate Proof
const proof = await prover.prove(witness);

// Verify Proof
const isValid = await prover.verify(proof);

console.log('Proof verification:', isValid);
```

### Generating `Prover.toml` file

The `@zkpersona/noir-helpers` package also provides a function to generate a `Prover.toml` file from a JSON object. Here's an example of how to use the `generateToml` function:

```typescript
import { generateToml } from '@zkpersona/noir-helpers';

const data = { x: '1', y: '2' };
const filePath = 'absolute/path/to/Prover.toml';

generateToml(data, filePath);
```

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
