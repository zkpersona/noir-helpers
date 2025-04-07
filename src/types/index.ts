import type { BackendOptions } from '@aztec/bb.js';
import type { InputMap } from '@noir-lang/noir_js';

/**
 * Options for configuring circuit behavior and optimization settings.
 * These options affect how the circuit is compiled and optimized.
 */
type CircuitOptions = {
  /**
   * @description Whether to produce SNARK friendly proofs
   *
   * @default false
   */
  recursive: boolean;
};

/**
 * Configuration for the proving backend system.
 * This type defines the complete setup for the proving system, including
 * backend selection, optimization options, and circuit-specific settings.
 */
export type ProvingBackend = {
  /**
   * The type of proving backend to use.
   *
   * @default 'plonk'
   * @remarks
   * - 'honk': Uses the HONK proving system
   * - 'plonk': Uses the PLONK proving system
   * - 'all': Initialize all available proving systems
   */
  type?: 'honk' | 'plonk' | 'all';

  /**
   * Additional options specific to the selected backend.
   * These options are passed directly to the underlying proving system.
   *
   * @default undefined
   * @see {@link BackendOptions} for available options
   */
  options?: BackendOptions;

  /**
   * Circuit-specific configuration options.
   * Controls how the circuit is compiled and optimized.
   *
   * @default undefined
   * @see {@link CircuitOptions} for available options
   */
  circuitOptions?: CircuitOptions;
};

/**
 * @description The value of an input to a circuit.
 */
export type InputValue = InputMap[string];
