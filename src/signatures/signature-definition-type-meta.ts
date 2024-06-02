import { SignaturePayloadDefinitionType } from '../types/payloads';
import { SignatureDefinitionType } from '../types/signature-definition';

export interface SignatureDefinitionTypeMetaOptions {
  type: SignatureDefinitionType;
  keyType?: SignatureDefinitionType;
  valueType?: SignatureDefinitionType;
}

export class SignatureDefinitionTypeMeta {
  readonly type: SignatureDefinitionType;
  readonly keyType: SignatureDefinitionType | null;
  readonly valueType: SignatureDefinitionType | null;

  static parse(
    value: SignaturePayloadDefinitionType
  ): SignatureDefinitionTypeMeta {
    if (typeof value === 'string') {
      return new SignatureDefinitionTypeMeta({ type: value });
    } else if (typeof value === 'object') {
      return new SignatureDefinitionTypeMeta({
        type: value.type,
        keyType: value.keyType,
        valueType: value.valueType
      });
    }

    throw new Error('Unable to parse type definition!');
  }

  constructor(options: SignatureDefinitionTypeMetaOptions) {
    this.type = options.type;
    this.keyType = options.keyType ?? null;
    this.valueType = options.valueType ?? null;
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
