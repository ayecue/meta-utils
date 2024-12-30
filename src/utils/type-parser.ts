import { SignaturePayloadDefinitionTypeMeta } from "../types/payloads";
import { SignatureDefinitionBaseType } from "../types/signature-definition";

export class TypeParser {
  private _rx: RegExp;
  private _input: string;
  private _lastMatch: RegExpExecArray | null;

  constructor(typeInput: string) {
    this._input = typeInput;
    this._rx = /(\w+|<|>|,)/g;
    this._lastMatch = null;
  }

  private next(): string | null {
    this._lastMatch = this._rx.exec(this._input);
    if (!this._lastMatch) return null;
    return this._lastMatch[0];
  }

  private createDefault(): SignaturePayloadDefinitionTypeMeta {
    return {
      type: SignatureDefinitionBaseType.Any
    };
  }

  private parseList(type: string): SignaturePayloadDefinitionTypeMeta {
    const meta: SignaturePayloadDefinitionTypeMeta = {
      type,
      valueType: SignatureDefinitionBaseType.Any
    };

    if (this.next() === '<') {
      const valueType = this.parse();
      meta.valueType = valueType;
      if (this.next() !== '>') return this.createDefault();
    }

    return meta;
  }

  private parseMap(type: string): SignaturePayloadDefinitionTypeMeta {
    const meta: SignaturePayloadDefinitionTypeMeta = {
      type,
      keyType: SignatureDefinitionBaseType.Any,
      valueType: SignatureDefinitionBaseType.Any
    };

    if (this.next() === '<') {
      const keyType = this.parse();
      meta.keyType = keyType;
      if (this.next() !== ',') return this.createDefault();
      const valueType = this.parse();
      meta.valueType = valueType;
      if (this.next() !== '>') return this.createDefault();
    }

    return meta;
  }

  parse(): SignaturePayloadDefinitionTypeMeta {
    const type = this.next();
    if (!type) return this.createDefault();

    switch (type) {
      case 'list':
        return this.parseList(type);
      case 'map':
        return this.parseMap(type);
    }

    return { type: type };
  }
}