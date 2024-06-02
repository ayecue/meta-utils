import { Signature } from "./signatures/signature";
import { SignatureDefinition } from "./signatures/signature-definition";
import { DescriptionsPayload, SignaturePayload } from "./types/payloads";
import { DescriptionContainerItem, SignatureDefinitionBaseType, SignatureDefinitionType } from "./types/signature-definition";

export interface InternalState {
  general: Signature;
  any: Signature;
}

export interface AddTypeSignatureOptions {
  type: string;
  extend?: string;
  definitions: Record<string, SignatureDefinition>;
}

export class Container {
  private internal: InternalState;
  private types: Map<SignatureDefinitionType, Signature>;

  constructor() {
    this.internal = {
      any: new Signature(SignatureDefinitionBaseType.Any),
      general: new Signature(SignatureDefinitionBaseType.General)
    };
    this.types = new Map([
      [SignatureDefinitionBaseType.String, new Signature(SignatureDefinitionBaseType.String)],
      [SignatureDefinitionBaseType.Function, new Signature(SignatureDefinitionBaseType.Function)],
      [SignatureDefinitionBaseType.Number, new Signature(SignatureDefinitionBaseType.Number)],
      [SignatureDefinitionBaseType.List, new Signature(SignatureDefinitionBaseType.List)],
      [SignatureDefinitionBaseType.Map, new Signature(SignatureDefinitionBaseType.Map)]
    ]);
  }

  private getOrCreateTypeSignature(type: SignatureDefinitionType) {
    let signature = this.getTypeSignature(type);
    if (signature == null) {
      signature = new Signature(type);
      this.types.set(type, signature);
    }
    return signature;
  }

  getTypeSignature(type: SignatureDefinitionType): Signature | null {
    switch (type) {
      case SignatureDefinitionBaseType.General: return this.internal.general;
      case SignatureDefinitionBaseType.Any: return this.internal.any;
      default: return this.types.get(type) ?? null;
    }
  }

  addTypeSignatureFromPayload(payload: SignaturePayload): this {
    const newSignature = Signature.parse(payload);
    this.addTypeSignature({
      type: newSignature.type,
      extend: newSignature.extend,
      definitions: newSignature.definitions
    });
    return this;
  }

  addTypeSignature(options: AddTypeSignatureOptions): this {
    const signature = this.getOrCreateTypeSignature(options.type);
    if (options.extend !== undefined) signature.setExtend(options.extend);
    signature.mergeDefinitions(options.definitions);
    return this;
  }

  addMetaFromPayload(language: string, payload: DescriptionsPayload): this {
    const meta: Record<SignatureDefinitionType, Record<string, DescriptionContainerItem>> = {};
    const keys = Object.keys(payload);

    for (const key of keys) {
      const parsed = Signature.parseDescriptions(meta[key]);
      meta[key] = parsed;
    }

    this.addMeta(language, meta);
    return this;
  }

  addMeta(language: string, meta: Record<SignatureDefinitionType, Record<string, DescriptionContainerItem>>): this {
    const { general: generalMeta, any: anyMeta, ...metaForTypes } = meta;
    const keys = Object.keys(metaForTypes);

    if (generalMeta != null) this.internal.general.addDescriptions(language, generalMeta);
    if (anyMeta != null) this.internal.any.addDescriptions(language, anyMeta);

    for (const key of keys) {
      const type = this.getOrCreateTypeSignature(key);
      type.addDescriptions(language, meta[key]);
    }

    return this;
  }

  getDefinitionMatches(types: string | SignatureDefinitionType[], property: string, language: string = 'en'): Map<SignatureDefinitionType, SignatureDefinition> {
    if (typeof types === 'string') return this.getDefinitionMatches([types], property, language);
    const matches: Map<SignatureDefinitionType, SignatureDefinition> = new Map();

    for (const type of types) {
      let currentType = type;
      let current = this.getTypeSignature(type);
      let match: SignatureDefinition = null;

      while (current !== null) {
        match = current.getDefinition(property, language);
        if (match !== null) break;
        currentType = current.extend;
        current = this.getTypeSignature(current.extend);
      }

      if (match === null) continue;
      matches.set(currentType, match);
    }

    return matches;
  }

  getDefinition(types: SignatureDefinitionType | SignatureDefinitionType[], property: string, language: string = 'en'): SignatureDefinition | null {
    if (typeof types === 'string') return this.getDefinition([types], property, language);
    const matches = this.getDefinitionMatches(types, property, language);

    if (matches.size === 0) {
      return null;
    } else if (matches.size === 1) {
      return matches.values().next().value;
    }

    if (matches.has(SignatureDefinitionBaseType.Any)) {
      return matches.get(SignatureDefinitionBaseType.Any);
    }

    const internalAnyDef = this.internal.any.getDefinition(property, language);

    if (internalAnyDef !== null) {
      return internalAnyDef;
    }

    return matches.values().next().value;
  }

  fork() {
    const container = new Container();

    container.internal.any = this.internal.any.copy();
    container.internal.general = this.internal.general.copy();

    for (const typeSignature of container.types.values()) {
      container.addTypeSignature({
        type: typeSignature.type,
        extend: typeSignature.extend,
        definitions: typeSignature.definitions
      });
      const signature = container.getTypeSignature(typeSignature.type);
      const languages = Object.keys(signature.descriptions);

      for (const language of languages) {
        signature.setDescriptions(language, signature.descriptions[language]);
      }
    }

    return container;
  }
}