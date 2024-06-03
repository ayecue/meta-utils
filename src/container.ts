import { Signature, SignatureOptions } from "./signatures/signature";
import { SignatureDefinition } from "./signatures/signature-definition";
import { DescriptionsPayload, SignaturePayload } from "./types/payloads";
import { DescriptionContainerItem, SignatureDefinitionBaseType, SignatureDefinitionType } from "./types/signature-definition";

export class Container {
  private _primitives: Map<SignatureDefinitionBaseType, Signature>;
  private _types: Map<SignatureDefinitionType, Signature>;
  private _excludeFromSearch: Set<SignatureDefinitionType>;

  constructor() {
    this._primitives = new Map([
      [SignatureDefinitionBaseType.Any, new Signature({ type: SignatureDefinitionBaseType.Any })],
      [SignatureDefinitionBaseType.General, new Signature({ type: SignatureDefinitionBaseType.General })],
      [SignatureDefinitionBaseType.String, new Signature({ type: SignatureDefinitionBaseType.String })],
      [SignatureDefinitionBaseType.Function, new Signature({ type: SignatureDefinitionBaseType.Function })],
      [SignatureDefinitionBaseType.Number, new Signature({ type: SignatureDefinitionBaseType.Number })],
      [SignatureDefinitionBaseType.List, new Signature({ type: SignatureDefinitionBaseType.List })],
      [SignatureDefinitionBaseType.Map, new Signature({ type: SignatureDefinitionBaseType.Map })]
    ]);
    this._types = new Map();
    this._excludeFromSearch = new Set();
  }

  private getOrCreateTypeSignature(type: SignatureDefinitionType) {
    let signature = this.getTypeSignature(type);
    if (signature == null) {
      signature = new Signature({ type });
      this._types.set(type, signature);
    }
    return signature;
  }

  getPrimitives() {
    return this._primitives;
  }

  getTypes() {
    return this._types;
  }

  excludeFromSearch(type: SignatureDefinitionType) {
    this._excludeFromSearch.add(type);
    return this;
  }

  includeToSearch(type: SignatureDefinitionType) {
    this._excludeFromSearch.delete(type);
    return this;
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

  getAllVisibleSignatures() {
    return [
      ...this.getAllPrimitiveSignatures(),
      ...this.getAllTypeSignatures()
    ].filter((signature) => signature.isHidden());
  }

  addTypeSignatureFromPayload(payload: SignaturePayload): this {
    const newSignature = Signature.parse(payload);
    this.addTypeSignature({
      type: newSignature.getType(),
      extends: newSignature.getExtendedType(),
      hidden: newSignature.isHidden(),
      definitions: newSignature.getDefinitions()
    });
    return this;
  }

  addTypeSignature(options: SignatureOptions): this {
    const signature = this.getOrCreateTypeSignature(options.type);
    if (options.extends !== undefined) signature.setExtend(options.extends);
    signature.mergeDefinitions(options.definitions);
    return this;
  }

  addMetaFromPayload(language: string, payload: DescriptionsPayload): this {
    const meta: Record<SignatureDefinitionType, Record<string, DescriptionContainerItem>> = {};
    const keys = Object.keys(payload);

    for (const key of keys) {
      const parsed = Signature.parseDescriptions(payload[key]);
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
    const visited = new Set();
    const matches: Map<SignatureDefinitionType, SignatureDefinition> = new Map();

    for (const type of typesSet) {
      if (this._excludeFromSearch.has(type)) continue;

      let currentType = type;
      let current = this.getTypeSignature(type);
      let match: SignatureDefinition = null;

      while (current !== null && !visited.has(current.getType())) {
        visited.add(current.getType());
        if (!current.isHidden()) match = current.getDefinition(property, language);
        if (match !== null) break;
        currentType = current.getExtendedType();
        current = this.getTypeSignature(currentType);
      }

      if (match === null) continue;
      matches.set(currentType, match);
    }

    return matches;
  }

  getDefinition(types: SignatureDefinitionType | SignatureDefinitionType[], property: string, language: string = 'en'): SignatureDefinition | null {
    if (typeof types === 'string') return this.getDefinition([types], property, language);
    const internalAnyDef = this._primitives.get(SignatureDefinitionBaseType.Any).getDefinition(property, language);

    if (types.includes(SignatureDefinitionBaseType.Any) && internalAnyDef) {
      return internalAnyDef;
    }

    const matches = this.searchDefinitionMatches(types, property, language);

    if (matches.size === 0) {
      return null;
    } else if (matches.size === 1) {
      return matches.values().next().value;
    }

    if (matches.has(SignatureDefinitionBaseType.Any)) {
      return matches.get(SignatureDefinitionBaseType.Any);
    }

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