import { Variation } from "./types/signature-definition";

class VariationContainer {
  private _variations: Set<Variation>;
  private _name: string;

  constructor(name: string) {
    this._name = name;
    this._variations = new Set();
  }

  getName() {
    return this._name;
  }

  push(...variations: Variation[]) {
    this._variations = new Set([...variations, ...this._variations]);
    return this;
  }

  getAll() {
    return [...this._variations];
  }
}

export class VariationRegistry {
  static variationContainers: Map<string, VariationContainer> = new Map();

  static add(name: string, variations: Variation[]) {
    const container = new VariationContainer(name);
    container.push(...variations);
    this.variationContainers.set(name, container);
    return this;
  }

  static get(name: string): VariationContainer | null {
    return this.variationContainers.get(name) ?? null;
  }

  static resolve(variations: Variation[]): Variation[] {
    let result = new Set<Variation>();

    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      if (typeof variation === 'string' && variation.startsWith('!')) {
        const name = variation.slice(1);
        const container = this.get(name);

        if (container !== null) {
          result = new Set([...container.getAll(), ...result]);
        } else {
          throw new Error(`Cannot find variation container for ${name}`);
        }

        continue;
      }

      result.add(variation);
    }

    return [...result];
  }
}