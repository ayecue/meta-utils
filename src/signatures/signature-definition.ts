import {
  DescriptionPayloadEntry,
  SignaturePayloadDefinition
} from '../types/payloads';
import {
  DescriptionContainerItem,
  Variation
} from '../types/signature-definition';
import { SignatureDefinitionTypeMeta } from './signature-definition-type-meta';

export interface SignatureDefinitionOptions {
  type: SignatureDefinitionTypeMeta;
  isProtected: boolean;
  description: string | null;
  example: string[] | null;
  variations: Variation[] | null;
}

export class SignatureDefinition {
  protected _type: SignatureDefinitionTypeMeta;
  protected _isProtected: boolean;
  protected _description: string | null;
  protected _example: string[] | null;
  protected _variations: Variation[] | null;

  static parse(payload: SignaturePayloadDefinition) {
    return new SignatureDefinition({
      type: SignatureDefinitionTypeMeta.parse(payload.type),
      isProtected: !!payload.isProtected,
      description: payload.description ?? null,
      example: payload.example ?? null,
      variations: payload.variations ?? null
    });
  }

  constructor(options: SignatureDefinitionOptions) {
    this._type = options.type;
    this._isProtected = options.isProtected;
    this._description = options.description;
    this._example = options.example;
    this._variations = options.variations;
  }

  getType() {
    return this._type;
  }

  isProtected() {
    return this._isProtected;
  }

  getDescription() {
    return this._description;
  }

  getExample() {
    return this._example;
  }

  setDescription(payload: DescriptionPayloadEntry): this {
    this._description = payload.description;
    this._example = payload.example ?? null;
    return this;
  }

  addVariation(variation: Variation): this {
    if (this._variations == null) {
      this._variations = [];
    }
    this._variations.push(variation);
    return this;
  }

  getVariations() {
    return this._variations;
  }

  toJSON() {
    return {
      type: this._type.toJSON(),
      isProtected: this._isProtected,
      description: this._description,
      example: this._example ? [...this._example] : null
    };
  }

  withDescription(item: DescriptionContainerItem | null): SignatureDefinition {
    return new SignatureDefinition({
      type: this._type,
      isProtected: this._isProtected,
      description: item?.description ?? this._description,
      example: item?.example ?? this._example,
      variations: this._variations
    });
  }

  copy() {
    return new SignatureDefinition({
      type: this._type.copy(),
      isProtected: this._isProtected,
      description: this._description,
      example: this._example,
      variations: this._variations
    });
  }
}
