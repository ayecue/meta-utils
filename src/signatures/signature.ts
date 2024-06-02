import Joi from 'joi';

import {
  descriptionContainerSchema,
  signatureDefinitionContainerSchema
} from '../schema';
import {
  DescriptionPayloadContainer,
  SignaturePayload,
  SignaturePayloadDefinitionContainer,
  SignaturePayloadDefinitionFunction
} from '../types/payloads';
import {
  DescriptionContainerItem,
  SignatureDefinitionBaseType,
  SignatureDefinitionType
} from '../types/signature-definition';
import { SignatureDefinition } from './signature-definition';
import { SignatureDefinitionFunction } from './signature-definition-function';

export class Signature {
  static parseDefinitions(
    payload: SignaturePayloadDefinitionContainer
  ): Record<string, SignatureDefinition> {
    Joi.assert(payload, signatureDefinitionContainerSchema);

    const definitions: Record<string, SignatureDefinition> = {};

    for (const [key, value] of Object.entries(payload)) {
      const parsed =
        value.type === SignatureDefinitionBaseType.Function
          ? SignatureDefinitionFunction.parse(
              value as SignaturePayloadDefinitionFunction
            )
          : SignatureDefinition.parse(value);

      definitions[key] = parsed;
    }

    return definitions;
  }

  static parseDescriptions(
    payload: DescriptionPayloadContainer
  ): Record<string, DescriptionContainerItem> {
    Joi.assert(payload, descriptionContainerSchema);

    const { $meta, ...records } = payload;
    const descriptions: Record<string, DescriptionContainerItem> = {};

    for (const [key, value] of Object.entries(records)) {
      descriptions[key] = {
        description: value.description,
        example: value.example ?? null
      };
    }

    return {
      $meta: {
        description: $meta?.description ?? 'unknown',
        example: $meta?.example ?? null
      },
      ...descriptions
    };
  }

  static parse(
    payload: SignaturePayload,
    languages?: Record<string, DescriptionPayloadContainer>
  ): Signature {
    const signature = new Signature(payload.type, payload.extends);
    const definitions = Signature.parseDefinitions(payload.definitions);

    signature.setDefinition(definitions);

    if (languages != null) {
      for (const [language, descriptionPayload] of Object.entries(languages)) {
        const descriptions = Signature.parseDescriptions(descriptionPayload);
        signature.addDescriptions(language, descriptions);
      }
    }

    return signature;
  }

  private _type: SignatureDefinitionType;
  private _extend: SignatureDefinitionType | null;
  private _definitions: Map<string, SignatureDefinition>;
  private _descriptions: Map<string, Record<string, DescriptionContainerItem>>;

  get type() {
    return this._type;
  }

  get extend() {
    return this._extend;
  }

  get definitions() {
    return this._definitions;
  }

  get descriptions() {
    return this._descriptions;
  }

  constructor(type: SignatureDefinitionType, extend?: SignatureDefinitionType) {
    this._type = type;
    this._extend = extend ?? null;
    this._descriptions = new Map();
    this._definitions = new Map();
  }

  setExtend(type: SignatureDefinitionType | null): this {
    this._extend = type;
    return this;
  }

  setDefinition(definitions: Record<string, SignatureDefinition>): this {
    this._definitions = new Map(Object.entries(definitions));
    return this;
  }

  mergeDefinitions(definitions: Record<string, SignatureDefinition>): this {
    const keys = Object.keys(definitions);

    for (const key of keys) {
      this._definitions.set(key, definitions[key]);
    }

    return this;
  }

  getDefinition(
    property: string,
    language?: string
  ): SignatureDefinition | null {
    const definition = this._definitions.get(property);
    if (definition == null) return null;
    const description = this.getDescriptions(language);
    const descriptionItem = description[property];

    return definition.withDescription(descriptionItem);
  }

  setDescriptions(
    language: string,
    input: Record<string, DescriptionContainerItem>
  ) {
    this._descriptions.set(language, input);
    return this;
  }

  addDescriptions(
    language: string,
    input: Record<string, DescriptionContainerItem>
  ) {
    const descriptions: Record<string, DescriptionContainerItem> =
      this._descriptions.get(language) ?? {};
    const keys = Object.keys(input);

    for (const key of keys) {
      descriptions[key] = {
        ...descriptions[key],
        ...input[key]
      };
    }

    this._descriptions.set(language, descriptions);

    return this;
  }

  getDescriptions(
    language: string = 'en'
  ): Record<string, DescriptionContainerItem> {
    const descriptions = this._descriptions.get(language);

    if (descriptions != null) {
      return descriptions;
    }

    return {};
  }

  toJSON() {
    const definitions: Record<
      string,
      ReturnType<SignatureDefinition['toJSON']>
    > = {};

    for (const [key, value] of this.definitions) {
      definitions[key] = value.toJSON();
    }

    return {
      type: this.type,
      extend: this.extend,
      definitions
    };
  }

  copy() {
    const signature = new Signature(this._type);
    const definitions = new Map();

    for (const [key, value] of this._definitions) {
      definitions.set(key, value.copy());
    }

    const descriptions = new Map();

    for (const [key, value] of this._descriptions) {
      descriptions.set(key, { ...value });
    }

    signature._descriptions = descriptions;
    signature._definitions = definitions;

    return signature;
  }
}
