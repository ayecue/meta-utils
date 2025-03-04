import {
  DescriptionPayloadEntry,
  SignaturePayloadDefinition
} from '../types/payloads';
import {
  DescriptionContainerItem,
  Variation
} from '../types/signature-definition';
import { VariationRegistry } from '../variation';
import { SignatureDefinitionTypeMeta } from './signature-definition-type-meta';

export interface SignatureDefinitionOptions {
  origin: string;
  type: SignatureDefinitionTypeMeta;
  isProtected: boolean;
  description: string | null;
  tags: string[] | null;
  example: string[] | null;
  variations: Variation[] | null;
}

export class SignatureDefinition {
  protected _origin: string;
  protected _type: SignatureDefinitionTypeMeta;
  protected _isProtected: boolean;
  protected _description: string | null;
  protected _example: string[] | null;
  protected _variations: Variation[] | null;
  protected _tags: string[] | null;

  static parse(origin: string, payload: SignaturePayloadDefinition) {
    return new SignatureDefinition({
      origin,
      type: SignatureDefinitionTypeMeta.parse(payload.type),
      isProtected: !!payload.isProtected,
      description: payload.description ?? null,
      example: payload.example ?? null,
      variations: payload.variations ?? null,
      tags: payload.tags ?? null
    });
  }

  constructor(options: SignatureDefinitionOptions) {
    this._origin = options.origin;
    this._type = options.type;
    this._isProtected = options.isProtected;
    this._description = options.description;
    this._example = options.example;
    this._variations = options.variations;
    this._tags = options.tags;
  }

  getOrigin() {
    return this._origin;
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

  getTags() {
    return this._tags;
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
    return VariationRegistry.resolve(this._variations);
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
      origin: this._origin,
      type: this._type,
      isProtected: this._isProtected,
      description: item?.description ?? this._description,
      example: item?.example ?? this._example,
      variations: this._variations,
      tags: this._tags
    });
  }

  copy() {
    return new SignatureDefinition({
      origin: this._origin,
      type: this._type.copy(),
      isProtected: this._isProtected,
      description: this._description,
      example: this._example,
      variations: this._variations,
      tags: this._tags
    });
  }
}
