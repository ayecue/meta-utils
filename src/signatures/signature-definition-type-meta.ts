import { SignaturePayloadDefinitionType } from '../types/payloads';
import {
  SignatureDefinitionBaseType,
  SignatureDefinitionType
} from '../types/signature-definition';

export interface SignatureDefinitionTypeMetaOptions {
  type: SignatureDefinitionType;
  keyType?: SignatureDefinitionType;
  valueType?: SignatureDefinitionType;
}

export class SignatureDefinitionTypeMeta {
  readonly type: SignatureDefinitionType;
  readonly keyType: SignatureDefinitionType | null;
  readonly valueType: SignatureDefinitionType | null;

  static fromString(value: string) {
    const matches = value.match(/^([a-zA-Z]+)(?:<([^>]+)>)?$/);

    if (!matches) return null;

    let valueType = null;
    let keyType = null;
    const [_, type, subTypes] = matches;

    if (type === SignatureDefinitionBaseType.Map) {
      valueType = SignatureDefinitionBaseType.Any;
      keyType = SignatureDefinitionBaseType.Any;
    } else if (type === SignatureDefinitionBaseType.List) {
      valueType = SignatureDefinitionBaseType.Any;
    }

    if (subTypes) {
      const types = subTypes.split(',').map((item) => item.trim());

      if (types.length > 2) return null;

      const [kType, vType] = types;

      if (vType != null) {
        valueType = vType;
        keyType = kType;
      } else {
        valueType = kType;
      }
    }

    return new SignatureDefinitionTypeMeta({
      type,
      keyType,
      valueType
    });
  }

  static parse(
    value: SignaturePayloadDefinitionType
  ): SignatureDefinitionTypeMeta {
    if (typeof value === 'string') {
      const type = value;
      let valueType = null;
      let keyType = null;

      if (type === SignatureDefinitionBaseType.Map) {
        valueType = SignatureDefinitionBaseType.Any;
        keyType = SignatureDefinitionBaseType.Any;
      } else if (type === SignatureDefinitionBaseType.List) {
        valueType = SignatureDefinitionBaseType.Any;
      }

      return new SignatureDefinitionTypeMeta({
        type,
        valueType,
        keyType
      });
    } else if (typeof value === 'object') {
      const type = value.type;
      let valueType = value.valueType ?? null;
      let keyType = value.keyType ?? null;

      if (type === SignatureDefinitionBaseType.Map) {
        valueType = valueType ?? SignatureDefinitionBaseType.Any;
        keyType = keyType ?? SignatureDefinitionBaseType.Any;
      } else if (type === SignatureDefinitionBaseType.List) {
        valueType = valueType ?? SignatureDefinitionBaseType.Any;
      }

      return new SignatureDefinitionTypeMeta({
        type,
        valueType,
        keyType
      });
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
      this.keyType === meta.keyType &&
      this.valueType === meta.valueType
    );
  }

  toString() {
    if (this.keyType === null) {
      if (this.valueType === null) {
        return this.type;
      }

      return `${this.type}<${this.valueType}>`;
    }

    return `${this.type}<${this.keyType},${this.valueType}>`;
  }

  toJSON():
    | { type: string; valueType: string }
    | { type: string; keyType: string; valueType: string }
    | string {
    if (this.keyType === null) {
      if (this.valueType === null) {
        return this.type;
      }

      return {
        type: this.type,
        valueType: this.valueType
      };
    }

    return {
      type: this.type,
      keyType: this.keyType,
      valueType: this.valueType
    };
  }

  copy() {
    return new SignatureDefinitionTypeMeta({
      type: this.type,
      keyType: this.keyType,
      valueType: this.valueType
    });
  }
}
