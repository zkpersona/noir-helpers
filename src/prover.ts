import {
  type ProofData,
  UltraHonkBackend,
  UltraPlonkBackend,
} from '@aztec/bb.js';
import { type CompiledCircuit, type InputMap, Noir } from '@noir-lang/noir_js';
import type { InputValue, ProvingBackend } from './types';

/**
 * A high-performance zero-knowledge prover supporting multiple proving systems.
 * This class provides a unified interface for generating and verifying
 * zero-knowledge proofs using either PLONK or HONK proving systems.
 *
 * @example
 * ```typescript
 * // Initialize the prover with a compiled circuit
 * const circuit = await Noir.compile(circuitSource);
 * const prover = new Prover(circuit, {
 *   type: 'plonk',
 *   circuitOptions: { recursive: true }
 * });
 *
 * try {
 *   // Generate a proof
 *   const proof = await prover.fullProve(inputs);
 *
 *   // Verify the proof
 *   const isValid = await prover.verify(proof);
 *
 *   console.log('Proof verification:', isValid);
 * } finally {
 *   // Clean up resources
 *   await prover.destroy();
 * }
 * ```
 */
export class Prover {
  plonk?: UltraPlonkBackend;
  honk?: UltraHonkBackend;
  noir: Noir;
  provingBackend: ProvingBackend;

  /**
   * Creates a new instance of the Prover.
   *
   * @param circuit - The compiled Noir circuit to use for proving
   * @param provingBackend - Configuration for the proving backend
   *
   * @throws {Error} If the circuit bytecode is invalid or malformed
   * @throws {Error} If the proving backend configuration is invalid
   * @throws {Error} If backend initialization fails
   */
  constructor(circuit: CompiledCircuit, provingBackend: ProvingBackend) {
    const acirBytecode = circuit.bytecode;
    if (provingBackend.type === 'plonk' || provingBackend.type === 'all') {
      this.plonk = new UltraPlonkBackend(
        acirBytecode,
        provingBackend.options,
        provingBackend.circuitOptions
      );
    }
    if (provingBackend.type === 'honk' || provingBackend.type === 'all') {
      this.honk = new UltraHonkBackend(
        acirBytecode,
        provingBackend.options,
        provingBackend.circuitOptions
      );
    }
    this.provingBackend = provingBackend;
    this.noir = new Noir(circuit);
  }

  /**
   * Simulates the circuit execution to generate a witness.
   * This method executes the circuit with the given inputs to produce
   * a witness that can be used for proof generation.
   *
   * @param input - The input values for the circuit
   * @returns A promise that resolves to an object containing:
   *          - witness: The generated witness as a Uint8Array
   *          - returnValue: The circuit's return value
   *
   * @throws {Error} If the circuit execution fails
   * @throws {Error} If the input values are invalid or malformed
   * @throws {Error} If witness generation fails
   */
  async simulateWitness(
    input: InputMap
  ): Promise<{ witness: Uint8Array; returnValue: InputValue }> {
    return await this.noir.execute(input);
  }

  /**
   * Generates a zero-knowledge proof from a witness.
   *
   * @param witness - The witness generated from circuit execution
   * @param provingBackend - Optional override for the proving backend configuration
   * @returns A promise that resolves to the generated proof
   *
   * @throws {Error} If the witness is invalid or malformed
   * @throws {Error} If the proving backend is not initialized
   * @throws {Error} If proof generation fails
   */
  async prove(
    witness: Uint8Array,
    provingBackend?: ProvingBackend
  ): Promise<ProofData> {
    const backend = this.getProvingBackend(provingBackend?.type);
    return await backend.generateProof(witness);
  }

  /**
   * Generates a complete zero-knowledge proof from circuit inputs.
   * This is a convenience method that combines witness generation and proof generation.
   *
   * @param input - The input values for the circuit
   * @param provingBackend - Optional override for the proving backend configuration
   * @returns A promise that resolves to the generated proof
   *
   * @throws {Error} If witness generation fails
   * @throws {Error} If proof generation fails
   * @throws {Error} If the input values are invalid
   */
  async fullProve(
    input: InputMap,
    provingBackend?: ProvingBackend
  ): Promise<ProofData> {
    const { witness } = await this.simulateWitness(input);
    return this.prove(witness, provingBackend);
  }

  /**
   * Verifies a zero-knowledge proof.
   *
   * @param proof - The proof to verify
   * @param provingBackend - Optional override for the proving backend configuration
   * @returns A promise that resolves to true if the proof is valid, false otherwise
   *
   * @throws {Error} If the proof is invalid or malformed
   * @throws {Error} If the proving backend is not initialized
   * @throws {Error} If verification fails
   */
  async verify(
    proof: ProofData,
    provingBackend?: ProvingBackend
  ): Promise<boolean> {
    const backend = this.getProvingBackend(provingBackend?.type);
    return await backend.verifyProof(proof);
  }

  /**
   * Cleans up resources used by the proving backends.
   * This method should be called when the prover is no longer needed
   * to free up system resources. It is recommended to call this method
   * in a finally block or when the prover instance is being disposed.
   *
   * @returns A promise that resolves when cleanup is complete
   *
   * @throws {Error} If resource cleanup fails
   */
  async destroy() {
    if (this.plonk) {
      await this.plonk.destroy();
    }
    if (this.honk) {
      await this.honk.destroy();
    }
  }

  /**
   * Gets the appropriate proving backend based on the specified type.
   * This method handles backend selection and initialization state checking.
   *
   * @param backendType - Optional override for the backend type
   * @returns The initialized proving backend
   *
   * @throws {Error} If the backend type is invalid
   * @throws {Error} If the requested backend is not initialized
   *
   * @private
   */
  private getProvingBackend(backendType?: ProvingBackend['type']) {
    let type: 'plonk' | 'honk';
    if (backendType === 'plonk' || this.provingBackend.type === 'plonk') {
      type = 'plonk';
    } else if (backendType === 'honk' || this.provingBackend.type === 'honk') {
      type = 'honk';
    } else {
      throw new Error(
        'Specify a proving backend from either "plonk" or "honk"'
      );
    }

    let backend: UltraPlonkBackend | UltraHonkBackend;
    if (type === 'plonk' && this.plonk) {
      backend = this.plonk;
    } else if (type === 'honk' && this.honk) {
      backend = this.honk;
    } else {
      throw new Error(`Proving backend ${type} not initialized`);
    }

    return backend;
  }
}
