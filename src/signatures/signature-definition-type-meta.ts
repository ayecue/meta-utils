import {
  getSignaturePayloadDefinitionType,
  SignaturePayloadDefinitionType,
  SignaturePayloadDefinitionTypeMeta
} from '../types/payloads';
import {
  SignatureDefinitionBaseType,
  SignatureDefinitionType
} from '../types/signature-definition';
import { TypeParser } from '../utils/type-parser';

export interface SignatureDefinitionTypeMetaOptions {
  type: SignatureDefinitionType;
  keyType?: SignatureDefinitionTypeMeta;
  valueType?: SignatureDefinitionTypeMeta;
}

export type SignatureDefinitionTypeMetaJSON =
  | { type: string; valueType: SignatureDefinitionTypeMetaJSON }
  | { type: string; keyType: SignatureDefinitionTypeMetaJSON; valueType: SignatureDefinitionTypeMetaJSON }
  | string;

export class SignatureDefinitionTypeMeta {
  readonly type: SignatureDefinitionType;
  readonly keyType: SignatureDefinitionTypeMeta | null;
  readonly valueType: SignatureDefinitionTypeMeta | null;

  static fromString(value: string) {
    const parser = new TypeParser(value);
    const payload = parser.parse();
    return SignatureDefinitionTypeMeta.parse(payload);
  }

  static parseValueString(value: string) {
    const type = value;
    let valueType = null;
    let keyType = null;

    if (type === SignatureDefinitionBaseType.Map) {
      valueType = new SignatureDefinitionTypeMeta({ type: SignatureDefinitionBaseType.Any });
      keyType = new SignatureDefinitionTypeMeta({ type: SignatureDefinitionBaseType.Any });
    } else if (type === SignatureDefinitionBaseType.List) {
      valueType = new SignatureDefinitionTypeMeta({ type: SignatureDefinitionBaseType.Any });
    }

    return new SignatureDefinitionTypeMeta({
      type,
      valueType,
      keyType
    });
  }

  static parseValueObject(value: SignaturePayloadDefinitionTypeMeta) {
    const type = value.type;
    let valueType = null;
    let keyType = null;

    if (type === SignatureDefinitionBaseType.Map) {
      const rawKeyType = getSignaturePayloadDefinitionType(value.keyType) ?? SignatureDefinitionBaseType.Any;
      const rawValueType = getSignaturePayloadDefinitionType(value.valueType) ?? SignatureDefinitionBaseType.Any;
      if (rawKeyType === SignatureDefinitionBaseType.Map || rawKeyType === SignatureDefinitionBaseType.List) {
        keyType = SignatureDefinitionTypeMeta.parse(value.keyType);
      } else {
        keyType = new SignatureDefinitionTypeMeta({ type: rawKeyType });
      }
      if (rawValueType === SignatureDefinitionBaseType.Map || rawValueType === SignatureDefinitionBaseType.List) {
        valueType = SignatureDefinitionTypeMeta.parse(value.valueType);
      } else {
        valueType = new SignatureDefinitionTypeMeta({ type: rawValueType });
      }
    } else if (type === SignatureDefinitionBaseType.List) {
      const rawValueType = getSignaturePayloadDefinitionType(value.valueType) ?? SignatureDefinitionBaseType.Any;
      if (rawValueType === SignatureDefinitionBaseType.Map || rawValueType === SignatureDefinitionBaseType.List) {
        valueType = SignatureDefinitionTypeMeta.parse(value.valueType);
      } else {
        valueType = new SignatureDefinitionTypeMeta({ type: rawValueType });
      }
    }

    return new SignatureDefinitionTypeMeta({
      type,
      valueType,
      keyType
    });
  }

  static parse(
    value: SignaturePayloadDefinitionType
  ): SignatureDefinitionTypeMeta {
    if (typeof value === 'string') {
      return SignatureDefinitionTypeMeta.parseValueString(value);
    } else if (typeof value === 'object') {
      return SignatureDefinitionTypeMeta.parseValueObject(value);
    }

    throw new Error('Unable to parse type definition!');
  }

  constructor(options: SignatureDefinitionTypeMetaOptions) {
    this.type = options.type;
    this.keyType = options.keyType ?? null;
    this.valueType = options.valueType ?? null;
  }

  isEqual(meta: SignatureDefinitionTypeMeta) {
    return this.type === meta.type;
  }

  isEqualSafe(meta: SignatureDefinitionTypeMeta) {
    return (
      this.type === meta.type &&
      this.keyType.type === meta.keyType.type &&
      this.valueType.type === meta.valueType.type
    );
  }

  toString(): string {
    if (this.keyType === null) {
      if (this.valueType === null) {
        return this.type;
      }

      return `${this.type}<${this.valueType.toString()}>`;
    }

    return `${this.type}<${this.keyType.toString()},${this.valueType.toString()}>`;
  }

  toJSON(): SignatureDefinitionTypeMetaJSON {
    if (this.keyType === null) {
      if (this.valueType === null) {
        return this.type;
      }

      return {
        type: this.type,
        valueType: this.valueType.toJSON()
      };
    }

    return {
      type: this.type,
      keyType: this.keyType.toJSON(),
      valueType: this.valueType.toJSON()
    };
  }

  copy(): SignatureDefinitionTypeMeta {
    return new SignatureDefinitionTypeMeta({
      type: this.type,
      keyType: this.keyType?.copy(),
      valueType: this.valueType?.copy()
    });
  }
}
