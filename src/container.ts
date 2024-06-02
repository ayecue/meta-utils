import { Signature } from "./signatures/signature";
import { SignatureDefinition } from "./signatures/signature-definition";
import { DescriptionsPayload, SignaturePayload } from "./types/payloads";
import { DescriptionContainerItem, SignatureDefinitionBaseType, SignatureDefinitionType } from "./types/signature-definition";

export interface AddTypeSignatureOptions {
  type: string;
  extend?: string;
  definitions: Record<string, SignatureDefinition>;
}

export class Container {
  private _primitives: Map<SignatureDefinitionBaseType, Signature>;
  private _types: Map<SignatureDefinitionType, Signature>;
  private _excludeFromSearch: Set<SignatureDefinitionType>;

  get primitives() {
    return this._primitives;
  }

  get types() {
    return this._types;
  }

  get excludeFromSearch() {
    return this._excludeFromSearch;
  }

  constructor() {
    this._primitives = new Map([
      [SignatureDefinitionBaseType.Any, new Signature(SignatureDefinitionBaseType.Any)],
      [SignatureDefinitionBaseType.General, new Signature(SignatureDefinitionBaseType.General)],
      [SignatureDefinitionBaseType.String, new Signature(SignatureDefinitionBaseType.String)],
      [SignatureDefinitionBaseType.Function, new Signature(SignatureDefinitionBaseType.Function)],
      [SignatureDefinitionBaseType.Number, new Signature(SignatureDefinitionBaseType.Number)],
      [SignatureDefinitionBaseType.List, new Signature(SignatureDefinitionBaseType.List)],
      [SignatureDefinitionBaseType.Map, new Signature(SignatureDefinitionBaseType.Map)]
    ]);
    this._types = new Map();
    this._excludeFromSearch = new Set();
  }

  private getOrCreateTypeSignature(type: SignatureDefinitionType) {
    let signature = this.getTypeSignature(type);
    if (signature == null) {
      signature = new Signature(type);
      this._types.set(type, signature);
    }
    return signature;
  }

  getTypeSignature(type: SignatureDefinitionType): Signature | null {
    return this._primitives.get(type as SignatureDefinitionBaseType) ?? this._types.get(type) ?? null;
  }

  getAllPrimitiveSignatures(): Signature[] {
    return Array.from(this._primitives.values());
  }

  getAllTypeSignatures(): Signature[] {
    return Array.from(this._types.values());
  }

  getAllSignatures() {
    return [
      ...this.getAllPrimitiveSignatures(),
      ...this.getAllTypeSignatures()
    ];
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
    const keys = Object.keys(meta);

    for (const key of keys) {
      const type = this.getOrCreateTypeSignature(key);
      type.addDescriptions(language, meta[key]);
    }

    return this;
  }

  searchDefinitionMatches(types: string | SignatureDefinitionType[], property: string, language: string = 'en'): Map<SignatureDefinitionType, SignatureDefinition> {
    if (typeof types === 'string') return this.searchDefinitionMatches([types], property, language);
    const typesSet = new Set(types);
    const matches: Map<SignatureDefinitionType, SignatureDefinition> = new Map();

    for (const type of typesSet) {
      if (this._excludeFromSearch.has(type)) continue;

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
    const matches = this.searchDefinitionMatches(types, property, language);

    if (matches.size === 0) {
      return null;
    } else if (matches.size === 1) {
      return matches.values().next().value;
    }

    if (matches.has(SignatureDefinitionBaseType.Any)) {
      return matches.get(SignatureDefinitionBaseType.Any);
    }

    const internalAnyDef = this._primitives.get(SignatureDefinitionBaseType.Any).getDefinition(property, language);

    if (internalAnyDef !== null) {
      return internalAnyDef;
    }

    return matches.values().next().value;
  }

  fork() {
    const container = new Container();

    for (const [key, value] of this._primitives) {
      container._primitives.set(key, value.copy());
    };
    for (const [key, value] of this._types) {
      container._types.set(key, value.copy());
    }
    container._excludeFromSearch = new Set(this._excludeFromSearch);

    return container;
  }
}