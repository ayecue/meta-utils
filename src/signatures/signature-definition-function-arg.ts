import { SignaturePayloadDefinitionArg } from '../types/payloads';
import { SignatureDefinitionFunctionArgDefault } from '../types/signature-definition';
import { SignatureDefinitionTypeMeta } from './signature-definition-type-meta';

export interface SignatureDefinitionFunctionArgOptions {
  label: string;
  types: SignatureDefinitionTypeMeta[];
  opt: boolean;
  default: SignatureDefinitionFunctionArgDefault | null;
}

export class SignatureDefinitionFunctionArg {
  private _label: string;
  private _types: Map<string, SignatureDefinitionTypeMeta>;
  private _opt: boolean;
  private _default: SignatureDefinitionFunctionArgDefault | null;

  static parse(payload: SignaturePayloadDefinitionArg) {
    const types: SignatureDefinitionTypeMeta[] = [];

    if (payload.type) {
      types.push(SignatureDefinitionTypeMeta.parse(payload.type));
    } else if (payload.types) {
      types.push(...payload.types.map(SignatureDefinitionTypeMeta.parse));
    } else {
      throw new Error('Invalid signature definition function arg payload!');
    }

    return new SignatureDefinitionFunctionArg({
      label: payload.label,
      types,
      opt: payload.opt ?? false,
      default: payload.default ?? null
    });
  }

  constructor(options: SignatureDefinitionFunctionArgOptions) {
    this._label = options.label;
    this._types = options.types.reduce<
      Map<string, SignatureDefinitionTypeMeta>
    >((result, returnVal) => {
      return result.set(returnVal.type, returnVal);
    }, new Map());
    this._opt = options.opt;
    this._default = options.default;
  }

  getLabel() {
    return this._label;
  }

  isOptional() {
    return this._opt;
  }

  getDefault() {
    return this._default;
  }

  getTypes() {
    return [...this._types.values()];
  }

  isValidType(meta: SignatureDefinitionTypeMeta) {
    return this._types.has(meta.type);
  }

  isValidTypeSafe(meta: SignatureDefinitionTypeMeta) {
    return !!this._types.get(meta.type)?.isEqualSafe(meta);
  }

  toJSON() {
    return {
      label: this._label,
      types: this.getTypes().map((type) => type.toJSON()),
      opt: this._opt,
      default: this._default
    };
  }

  copy() {
    return new SignatureDefinitionFunctionArg({
      label: this._label,
      types: this.getTypes().map((type) => type.copy()),
      opt: this._opt,
      default: this._default
    });
  }
}
