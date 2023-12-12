import fastClone from 'fast-clone';
import memoizee from 'memoizee';

import {
  Descriptions,
  EnrichContainerFunction,
  GetDefinitionsFunction,
  Signature,
  SignatureDefinition,
  SignatureDefinitionContainer
} from './types';

export interface CollectionOptions {
  defaultType?: string;
  signatures?: Map<string, SignatureDefinitionContainer>;
  meta?: Map<string, Descriptions>;
}

export class Collection {
  private signatures: Map<string, SignatureDefinitionContainer>;
  private meta: Map<string, Descriptions>;
  private defaultType: string;
  private types: string[];
  private enrichContainer: EnrichContainerFunction;

  getDefinitions: GetDefinitionsFunction;

  constructor({
    defaultType = 'any',
    signatures = new Map(),
    meta = new Map()
  }: CollectionOptions = {}) {
    this.signatures = signatures;
    this.meta = meta;
    this.defaultType = defaultType;
    this.types = [];

    this.initialize();
  }

  private initialize() {
    this.enrichContainer = memoizee<EnrichContainerFunction>(
      (type, container, language?) => {
        return Object.entries(container).reduce(
          (result: SignatureDefinitionContainer, [name, def]) => ({
            ...result,
            [name]: {
              ...def,
              description: this.getDescription(type, name, language),
              example: this.getExample(type, name, language)
            }
          }),
          {}
        );
      },
      { length: false, primitive: true }
    );

    this.getDefinitions = memoizee<GetDefinitionsFunction>(
      (types: string[], language?: string) => {
        const defaultType = this.defaultType;

        if (types.includes(defaultType)) {
          return this.getDefinitions(this.getAllTypes(), language);
        }

        const anyDefinitions = this.getSignaturesByType(defaultType);

        return types
          .map((type) => {
            const [main] = type.split(':');
            return this.enrichContainer(
              main,
              this.getSignaturesByType(main) || {},
              language
            );
          })
          .reduce((result, definitions) => {
            for (const [key, definition] of Object.entries(definitions)) {
              if (key in result && key in anyDefinitions) {
                result[key] = {
                  ...anyDefinitions[key],
                  description: this.getDescription(defaultType, key, language),
                  example: this.getExample(defaultType, key, language)
                };
              } else {
                result[key] = definition;
              }
            }
            return result;
          }, {});
      },
      { length: false, primitive: true }
    );
  }

  addSignature(
    type: string,
    container: SignatureDefinitionContainer,
    excludeFromAllTypes: boolean = false
  ) {
    const item = this.signatures.get(type) ?? {};

    this.signatures.set(type, {
      ...item,
      ...container
    });

    if (!excludeFromAllTypes) this.types.push(type);

    return this;
  }

  getAllSignatures(): Signature[] {
    return Array.from(this.signatures.entries()).map(([type, definitions]) => {
      return {
        type,
        definitions
      };
    });
  }

  getSignaturesByType(type: string): SignatureDefinitionContainer | null {
    return this.signatures.get(type);
  }

  getAllTypes(): string[] {
    return this.types.filter((type) => type !== this.defaultType);
  }

  addMeta(language: string, container: Descriptions) {
    const metaItem = this.meta.get(language) ?? {};

    for (const [type, dContainer] of Object.entries(container)) {
      metaItem[type] = {
        ...metaItem[type],
        ...dContainer
      };
    }

    this.meta.set(language, metaItem);

    return this;
  }

  getMeta(language: string = 'en'): Descriptions {
    if (this.meta.has(language)) {
      return this.meta.get(language);
    }

    throw new Error(`Language "${language}" is unknown.`);
  }

  getDescription(type: string, method: string, language?: string): string {
    const lang = this.getMeta(language);
    return lang?.[type]?.[method]?.description;
  }

  getExample(type: string, method: string, language?: string): string[] {
    const lang = this.getMeta(language);
    return lang?.[type]?.[method]?.example;
  }

  getDefinition(
    types: string[],
    property: string,
    language?: string
  ): SignatureDefinition | null {
    const definitions = this.getDefinitions(types, language);

    if (Object.prototype.hasOwnProperty.call(definitions, property)) {
      return definitions[property];
    }

    return null;
  }

  fork() {
    return new Collection({
      defaultType: this.defaultType,
      signatures: new Map(fastClone(Array.from(this.signatures.entries()))),
      meta: new Map(fastClone(Array.from(this.meta.entries())))
    });
  }
}
