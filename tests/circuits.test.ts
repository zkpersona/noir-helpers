import { beforeAll, describe, expect, it } from 'vitest';

import { Prover, U8, toCircuitInputs } from '../src';

import circuit from '../target/circuits.json' assert { type: 'json' };

import type { CompiledCircuit } from '@noir-lang/noir_js';

const inputs = { x: new U8(1), y: new U8(2) };

describe('Circuit Proof Verification', () => {
  let prover: Prover;

  beforeAll(() => {
    prover = new Prover(circuit as CompiledCircuit, { type: 'all' });
  });

  it('should prove using honk backend', async () => {
    const parsedInputs = toCircuitInputs(inputs);
    const proof = await prover.fullProve(parsedInputs, { type: 'honk' });
    const isVerified = await prover.verify(proof, { type: 'honk' });

    expect(isVerified).toBe(true);
  });

  it('should prove using plonk backend', async () => {
    const parsedInputs = toCircuitInputs(inputs);
    const proof = await prover.fullProve(parsedInputs, { type: 'plonk' });
    const isVerified = await prover.verify(proof, { type: 'plonk' });

    expect(isVerified).toBe(true);
  });
});
