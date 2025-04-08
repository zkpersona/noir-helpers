import { z } from 'zod';

const MAX_FIELD_SIZE =
  21888242871839275222246405745257275088548364400416034343698204186575808495616n;

const fieldInputSchema = z.union([
  z.number().int('Field input must be an integer'),
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
  .refine(
    (n) => n <= MAX_FIELD_SIZE && n >= -MAX_FIELD_SIZE,
    'Field value must be between -MAX_FIELD_SIZE and MAX_FIELD_SIZE'
  );

export const IntegerValidator = (min: bigint, max: bigint) =>
  fieldInputSchema
    .transform((n) => BigInt(n))
    .refine((n) => n >= min && n <= max, {
      message: `Value must be in range [${min}, ${max}]`,
    });

export type FieldInput = z.infer<typeof fieldInputSchema>;
export type IntegerInput = z.infer<typeof fieldInputSchema>;
