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
  private _argList: string[];
  private _argRefs: Map<string, SignatureDefinitionFunctionArg>;
  private _returns: Map<string, SignatureDefinitionTypeMeta>;

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
    this._argList = options.arguments.map((item) => item.getLabel());
    this._argRefs = options.arguments.reduce<
      Map<string, SignatureDefinitionFunctionArg>
    >((result, argVal) => {
      return result.set(argVal.getLabel(), argVal);
    }, new Map());
    this._returns = options.returns.reduce<
      Map<string, SignatureDefinitionTypeMeta>
    >((result, returnVal) => {
      return result.set(returnVal.type, returnVal);
    }, new Map());
  }

  getArguments(): SignatureDefinitionFunctionArg[] {
    return this._argList.map((label) => this._argRefs.get(label));
  }

  getArgument(label: string): SignatureDefinitionFunctionArg | null {
    return this._argRefs.get(label) ?? null;
  }

  getReturns(): SignatureDefinitionTypeMeta[] {
    return [...this._returns.values()];
  }

  toJSON() {
    return {
      ...super.toJSON(),
      arguments: this.getArguments().map((item) => item.toJSON()),
      returns: this.getReturns().map((item) => item.toJSON())
    };
  }

  withDescription(item: DescriptionContainerItem | null): SignatureDefinition {
    return new SignatureDefinitionFunction({
      type: this.type,
      isProtected: this.isProtected,
      arguments: this.getArguments(),
      returns: this.getReturns(),
      description: item?.description ?? this.description,
      example: item?.example ?? this.example
    });
  }

  copy() {
    return new SignatureDefinitionFunction({
      type: this.type.copy(),
      isProtected: this.isProtected,
      arguments: this.getArguments().map((item) => item.copy()),
      returns: this.getReturns().map((item) => item.copy()),
      description: this.description,
      example: this.example
    });
  }
}
