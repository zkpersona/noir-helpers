import { z } from 'zod';

const MAX_FIELD = 2n ** 254n - 1n;

const fieldInputSchema = z.union([
  z
    .number()
    .int('Field input must be an integer')
    .nonnegative('Field input must be non-negative'),
  z.bigint(),
  z
    .string()
    .refine(
      (str) => /^0x[0-9a-fA-F]+$/.test(str) || /^\d+$/.test(str),
      'String must be a decimal or hexadecimal number'
    ),
]);

export const FieldValidator = fieldInputSchema
  .transform((val): bigint => {
    if (typeof val === 'string') {
      return BigInt(val); // handles both hex and decimal
    }
    return BigInt(val);
  })
  .refine((n) => n <= MAX_FIELD, 'Field value must be between 0 and 2^254 - 1');

export const IntegerValidator = (min: bigint, max: bigint) =>
  z
    .union([
      z.number().int('Input must be a integer'),
      z.string().regex(/^-?\d+$/),
      z.bigint(),
    ])
    .transform((n) => BigInt(n))
    .refine((n) => n >= min && n <= max, {
      message: `Value must be in range [${min}, ${max}]`,
    });

export type FieldInput = z.infer<typeof fieldInputSchema>;
export type IntegerInput = z.infer<typeof fieldInputSchema>;
