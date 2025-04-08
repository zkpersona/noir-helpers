import { z } from 'zod';

const fieldInputSchema = z.union([
  z
    .number()
    .int('Field input must be an integer')
    .nonnegative('Field input must be non-negative'),
  z.string().regex(/^\d+$/),
  z.bigint().refine((n) => n >= 0n),
]);

export const FieldValidator = fieldInputSchema
  .transform((n) => BigInt(n))
  .refine((n) => {
    return n <= 2n ** 254n - 1n;
  }, 'Field value exceeds 254 bits');

export type FieldInput = z.infer<typeof fieldInputSchema>;
