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
  private _definitions: Record<string, SignatureDefinition>;
  private _descriptions: Record<
    string,
    Record<string, DescriptionContainerItem>
  >;

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
    this._descriptions = {};
    this._definitions = {};
  }

  setExtend(type: SignatureDefinitionType | null): this {
    this._extend = type;
    return this;
  }

  setDefinition(definitions: Record<string, SignatureDefinition>): this {
    this._definitions = definitions;
    return this;
  }

  mergeDefinitions(definitions: Record<string, SignatureDefinition>): this {
    const keys = Object.keys(definitions);

    for (const key of keys) {
      this._definitions[key] = definitions[key];
    }

    return this;
  }

  getDefinition(
    property: string,
    language?: string
  ): SignatureDefinition | null {
    const definition = this._definitions[property];
    if (definition == null) return null;
    const description = this.getDescriptions(language);
    const descriptionItem = description[property];

    return definition.withDescription(descriptionItem);
  }

  setDescriptions(
    language: string,
    input: Record<string, DescriptionContainerItem>
  ) {
    this._descriptions[language] = input;
    return this;
  }

  addDescriptions(
    language: string,
    input: Record<string, DescriptionContainerItem>
  ) {
    let descriptions: Record<string, DescriptionContainerItem> =
      this._descriptions[language];

    if (descriptions == null) {
      descriptions = {};
      this._descriptions[language] = descriptions;
    }

    const keys = Object.keys(input);

    for (const key of keys) {
      descriptions[key] = {
        ...descriptions[key],
        ...input[key]
      };
    }

    return this;
  }

  getDescriptions(
    language: string = 'en'
  ): Record<string, DescriptionContainerItem> {
    const descriptions = this._descriptions[language];

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
    const keys = Object.keys(this._definitions);

    for (const key of keys) {
      definitions[key] = this._definitions[key].toJSON();
    }

    return {
      type: this.type,
      extend: this.extend,
      definitions
    };
  }

  copy() {
    const signature = new Signature(this._type);
    const definitions: Signature['_definitions'] = {};
    const definitionKeys = Object.keys(this._definitions);

    for (const key of definitionKeys) {
      definitions[key] = this._definitions[key].copy();
    }

    const descriptions: Signature['_descriptions'] = {};
    const descriptionsKeys = Object.keys(this._descriptions);

    for (const key of descriptionsKeys) {
      descriptions[key] = { ...descriptions[key] };
    }

    signature._descriptions = descriptions;
    signature._definitions = definitions;

    return signature;
  }
}
