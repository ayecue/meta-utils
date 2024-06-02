import {
  DescriptionPayloadEntry,
  SignaturePayloadDefinition
} from '../types/payloads';
import { DescriptionContainerItem } from '../types/signature-definition';
import { SignatureDefinitionTypeMeta } from './signature-definition-type-meta';

export interface SignatureDefinitionOptions {
  type: SignatureDefinitionTypeMeta;
  isProtected: boolean;
  description: string | null;
  example: string[] | null;
}

export class SignatureDefinition {
  readonly type: SignatureDefinitionTypeMeta;
  readonly isProtected: boolean;
  description: string | null;
  example: string[] | null;

  static parse(payload: SignaturePayloadDefinition) {
    return new SignatureDefinition({
      type: SignatureDefinitionTypeMeta.parse(payload.type),
      isProtected: !!payload.isProtected,
      description: payload.description ?? null,
      example: payload.example ?? null
    });
  }

  constructor(options: SignatureDefinitionOptions) {
    this.type = options.type;
    this.isProtected = options.isProtected;
    this.description = options.description;
    this.example = options.example;
  }

  setDescription(payload: DescriptionPayloadEntry): this {
    this.description = payload.description;
    this.example = payload.example ?? null;
    return this;
  }

  toJSON() {
    return {
      type: this.type.toJSON(),
      isProtected: this.isProtected,
      description: this.description,
      example: this.example ? [...this.example] : null
    };
  }

  withDescription(item: DescriptionContainerItem | null): SignatureDefinition {
    return new SignatureDefinition({
      type: this.type,
      isProtected: this.isProtected,
      description: item?.description ?? this.description,
      example: item?.example ?? this.example
    });
  }

  copy() {
    return new SignatureDefinition({
      type: this.type.copy(),
      isProtected: this.isProtected,
      description: this.description,
      example: this.example
    });
  }
}
