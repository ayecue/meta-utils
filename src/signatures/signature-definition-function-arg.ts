import { SignaturePayloadDefinitionArg } from '../types/payloads';
import { SignatureDefinitionTypeMeta } from './signature-definition-type-meta';

export interface SignatureDefinitionFunctionArgOptions {
  label: string;
  type: SignatureDefinitionTypeMeta;
  opt: boolean;
  default: string | null;
}

export class SignatureDefinitionFunctionArg {
  label: string;
  type: SignatureDefinitionTypeMeta;
  opt: boolean;
  default: string | null;

  static parse(payload: SignaturePayloadDefinitionArg) {
    return new SignatureDefinitionFunctionArg({
      label: payload.label,
      type: SignatureDefinitionTypeMeta.parse(payload.type),
      opt: payload.opt ?? false,
      default: payload.default ?? null
    });
  }

  constructor(options: SignatureDefinitionFunctionArgOptions) {
    this.label = options.label;
    this.type = options.type;
    this.opt = options.opt;
    this.default = options.default;
  }

  toJSON() {
    return {
      label: this.label,
      type: this.type.toJSON(),
      opt: this.opt,
      default: this.default
    };
  }

  copy() {
    return new SignatureDefinitionFunctionArg({
      label: this.label,
      type: this.type.copy(),
      opt: this.opt,
      default: this.default
    });
  }
}
