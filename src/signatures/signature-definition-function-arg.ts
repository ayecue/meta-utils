import { SignaturePayloadDefinitionArg } from '../types/payloads';
import { SignatureDefinitionFunctionArgDefault } from '../types/signature-definition';
import { SignatureDefinitionTypeMeta } from './signature-definition-type-meta';

export interface SignatureDefinitionFunctionArgOptions {
  label: string;
  type: SignatureDefinitionTypeMeta;
  opt: boolean;
  default: SignatureDefinitionFunctionArgDefault | null;
}

export class SignatureDefinitionFunctionArg {
  readonly label: string;
  readonly type: SignatureDefinitionTypeMeta;
  readonly opt: boolean;
  readonly default: SignatureDefinitionFunctionArgDefault | null;

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
