import {
  DescriptionPayloadEntry,
  SignaturePayloadDefinitionFunction
} from '../types/payloads';
import {
  DescriptionContainerItem,
  SignatureDefinitionBaseType
} from '../types/signature-definition';
import {
  SignatureDefinition,
  SignatureDefinitionOptions
} from './signature-definition';
import { SignatureDefinitionFunctionArg } from './signature-definition-function-arg';
import { SignatureDefinitionTypeMeta } from './signature-definition-type-meta';

export interface SignatureDefinitionFunctionOptions
  extends SignatureDefinitionOptions {
  type: SignatureDefinitionTypeMeta;
  arguments: SignatureDefinitionFunctionArg[];
  returns: SignatureDefinitionTypeMeta[];
}

export class SignatureDefinitionFunction extends SignatureDefinition {
  readonly arguments: SignatureDefinitionFunctionArg[];
  readonly returns: SignatureDefinitionTypeMeta[];

  static parse(
    payload: SignaturePayloadDefinitionFunction
  ): SignatureDefinition {
    return new SignatureDefinitionFunction({
      type: new SignatureDefinitionTypeMeta({
        type: SignatureDefinitionBaseType.Function
      }),
      isProtected: payload.isProtected ?? false,
      description: payload.description ?? null,
      example: payload.example ?? null,
      arguments:
        payload.arguments?.map(SignatureDefinitionFunctionArg.parse) ?? [],
      returns: payload.returns.map(SignatureDefinitionTypeMeta.parse)
    });
  }

  constructor(options: SignatureDefinitionFunctionOptions) {
    super({
      type: options.type,
      isProtected: options.isProtected,
      description: options.description,
      example: options.example
    });
    this.arguments = options.arguments;
    this.returns = options.returns;
  }

  setDescription(payload: DescriptionPayloadEntry): this {
    this.description = payload.description;
    this.example = payload.example ?? null;
    return this;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      arguments: this.arguments.map((item) => item.toJSON()),
      returns: this.returns.map((item) => item.toJSON())
    };
  }

  withDescription(item: DescriptionContainerItem | null): SignatureDefinition {
    return new SignatureDefinitionFunction({
      type: this.type,
      isProtected: this.isProtected,
      arguments: this.arguments,
      returns: this.returns,
      description: item?.description ?? this.description,
      example: item?.example ?? this.example
    });
  }

  copy() {
    return new SignatureDefinitionFunction({
      type: this.type.copy(),
      isProtected: this.isProtected,
      arguments: this.arguments.map((item) => item.copy()),
      returns: this.returns.map((item) => item.copy()),
      description: this.description,
      example: this.example
    });
  }
}
