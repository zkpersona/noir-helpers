import { Field } from './field';
import { IntegerValidator } from './zod';
import type { IntegerInput } from './zod/index';

abstract class AbstractInteger extends Field {
  protected static MAX_VALUE: bigint;
  protected static MIN_VALUE: bigint;

  protected min() {
    return (this.constructor as typeof AbstractInteger).MIN_VALUE;
  }

  protected max() {
    return (this.constructor as typeof AbstractInteger).MAX_VALUE;
  }

  protected abstract newInstance(value: IntegerInput): this;

  constructor(input: IntegerInput) {
    super(input);
    const min = (this.constructor as typeof AbstractInteger).MIN_VALUE;
    const max = (this.constructor as typeof AbstractInteger).MAX_VALUE;
    IntegerValidator(min, max).parse(input);
  }

  override add(other: this): this {
    return super.add(other) as this;
  }

  override sub(other: this): this {
    return super.sub(other) as this;
  }

  override mul(other: this): this {
    return super.mul(other) as this;
  }

  override div(other: this): this {
    return super.div(other) as this;
  }

  override mod(other: this): this {
    return super.mod(other) as this;
  }

  wrappingAdd(other: this): this {
    const min = this.min();
    const max = this.max();
    const range = max - min + 1n;

    const a = this.value - min;
    const b = other.value - min;

    const mask = range - 1n;
    const sum = (a + b) & mask;

    return this.newInstance(sum + min);
  }

  wrappingSub(other: this): this {
    const min = this.min();
    const max = this.max();
    const range = max - min + 1n;

    const a = this.value - min;
    const b = other.value - min;

    const mask = range - 1n;
    const diff = (a - b) & mask;

    return this.newInstance(diff + min);
  }

  wrappingMul(other: this): this {
    const min = this.min();
    const max = this.max();
    const range = max - min + 1n;

    const a = this.value - min;
    const b = other.value - min;

    const mask = range - 1n;
    const prod = (a * b) & mask;

    return this.newInstance(prod + min);
  }
}

export class U8 extends AbstractInteger {
  protected static override MAX_VALUE = 255n;
  protected static override MIN_VALUE = 0n;

  protected newInstance(value: IntegerInput): this {
    return new U8(value) as this;
  }
}

export class U16 extends AbstractInteger {
  protected static override MAX_VALUE = 65535n;
  protected static override MIN_VALUE = 0n;

  protected newInstance(value: IntegerInput): this {
    return new U16(value) as this;
  }
}

export class U32 extends AbstractInteger {
  protected static override MAX_VALUE = 4294967295n;
  protected static override MIN_VALUE = 0n;

  protected newInstance(value: IntegerInput): this {
    return new U32(value) as this;
  }
}

export class U64 extends AbstractInteger {
  protected static override MAX_VALUE = 18446744073709551615n;
  protected static override MIN_VALUE = 0n;

  protected newInstance(value: IntegerInput): this {
    return new U64(value) as this;
  }
}

export class I8 extends AbstractInteger {
  protected static override MAX_VALUE = 127n;
  protected static override MIN_VALUE = -128n;

  protected newInstance(value: IntegerInput): this {
    return new I8(value) as this;
  }
}

export class I16 extends AbstractInteger {
  protected static override MAX_VALUE = 32767n;
  protected static override MIN_VALUE = -32768n;

  protected newInstance(value: IntegerInput): this {
    return new I16(value) as this;
  }
}

export class I32 extends AbstractInteger {
  protected static override MAX_VALUE = 2147483647n;
  protected static override MIN_VALUE = -2147483648n;

  protected newInstance(value: IntegerInput): this {
    return new I32(value) as this;
  }
}

export class I64 extends AbstractInteger {
  protected static override MAX_VALUE = 9223372036854775807n;
  protected static override MIN_VALUE = -9223372036854775808n;

  protected newInstance(value: IntegerInput): this {
    return new I64(value) as this;
  }
}
