import type { z } from 'zod';

import { Field } from './field';
import { type IntegerInput, IntegerValidator } from './zod';

abstract class AbstractInteger extends Field {
  protected static schema: z.ZodEffects<
    z.ZodEffects<
      z.ZodUnion<[z.ZodNumber, z.ZodString, z.ZodBigInt]>,
      bigint,
      string | number | bigint
    >,
    bigint,
    string | number | bigint
  >;

  protected abstract min(): bigint;
  protected abstract max(): bigint;
  protected abstract newInstance(value: IntegerInput): this;

  constructor(input: IntegerInput) {
    super(input);
    const schema = (this.constructor as typeof AbstractInteger).schema;
    schema.parse(input);
  }

  override add(other: this): this {
    return this.newInstance(this.value + other.value);
  }

  override sub(other: this): this {
    return this.newInstance(this.value - other.value);
  }

  override mul(other: this): this {
    return this.newInstance(this.value * other.value);
  }

  override div(other: this): this {
    if (other.value === 0n) {
      throw new Error('Division by zero');
    }
    return this.newInstance(this.value / other.value);
  }

  override mod(other: this): this {
    if (other.value === 0n) {
      throw new Error('Modulus by zero');
    }
    return this.newInstance(this.value % other.value);
  }

  wrappingAdd(other: this): this {
    const min = this.min();
    const max = this.max();
    const range = max - min + 1n;
    let sum = this.value + other.value - min;
    sum = ((sum % range) + range) % range;
    return this.newInstance(sum + min);
  }

  wrappingSub(other: this): this {
    const min = this.min();
    const max = this.max();
    const range = max - min + 1n;
    let diff = this.value - other.value - min;
    diff = ((diff % range) + range) % range;
    return this.newInstance(diff + min);
  }

  wrappingMul(other: this): this {
    const min = this.min();
    const max = this.max();
    const range = max - min + 1n;
    let prod = this.value * other.value - min;
    prod = ((prod % range) + range) % range;
    return this.newInstance(prod + min);
  }
}

export class U8 extends AbstractInteger {
  protected static override schema = IntegerValidator(0n, 255n);

  protected min(): bigint {
    return 0n;
  }

  protected max(): bigint {
    return 255n;
  }

  protected newInstance(value: IntegerInput): this {
    return new U8(value) as this;
  }
}

export class U16 extends AbstractInteger {
  protected static override schema = IntegerValidator(0n, 65535n);

  protected min(): bigint {
    return 0n;
  }

  protected max(): bigint {
    return 65535n;
  }

  protected newInstance(value: IntegerInput): this {
    return new U16(value) as this;
  }
}

export class U32 extends AbstractInteger {
  protected static override schema = IntegerValidator(0n, 4294967295n);

  protected min(): bigint {
    return 0n;
  }

  protected max(): bigint {
    return 4294967295n;
  }

  protected newInstance(value: IntegerInput): this {
    return new U32(value) as this;
  }
}

export class U64 extends AbstractInteger {
  protected static override schema = IntegerValidator(
    0n,
    18446744073709551615n
  );

  protected min(): bigint {
    return 0n;
  }

  protected max(): bigint {
    return 18446744073709551615n;
  }

  protected newInstance(value: IntegerInput): this {
    return new U64(value) as this;
  }
}

export class I8 extends AbstractInteger {
  protected static override schema = IntegerValidator(-128n, 127n);

  protected min(): bigint {
    return -128n;
  }

  protected max(): bigint {
    return 127n;
  }

  protected newInstance(value: IntegerInput): this {
    return new I8(value) as this;
  }
}

export class I16 extends AbstractInteger {
  protected static override schema = IntegerValidator(-32768n, 32767n);

  protected min(): bigint {
    return -32768n;
  }

  protected max(): bigint {
    return 32767n;
  }

  protected newInstance(value: IntegerInput): this {
    return new I16(value) as this;
  }
}

export class I32 extends AbstractInteger {
  protected static override schema = IntegerValidator(
    -2147483648n,
    2147483647n
  );

  protected min(): bigint {
    return -2147483648n;
  }

  protected max(): bigint {
    return 2147483647n;
  }

  protected newInstance(value: IntegerInput): this {
    return new I32(value) as this;
  }
}

export class I64 extends AbstractInteger {
  protected static override schema = IntegerValidator(
    -9223372036854775808n,
    9223372036854775807n
  );

  protected min(): bigint {
    return -9223372036854775808n;
  }

  protected max(): bigint {
    return 9223372036854775807n;
  }

  protected newInstance(value: IntegerInput): this {
    return new I64(value) as this;
  }
}
