import {
  SignatureDefinitionFunctionArgDefault,
  SignatureDefinitionType,
  Variation
} from './signature-definition';

export interface DescriptionPayloadEntry {
  description: string;
  example?: string[];
}

export interface DescriptionPayloadContainer {
  $meta?: DescriptionPayloadEntry;
  [key: string]: DescriptionPayloadEntry;
}

export interface DescriptionsPayload {
  [key: SignatureDefinitionType]: DescriptionPayloadContainer;
}

export interface SignaturePayloadDefinitionTypeMeta {
  type: SignatureDefinitionType;
  keyType?: SignaturePayloadDefinitionType;
  valueType?: SignaturePayloadDefinitionType;
}

export type SignaturePayloadDefinitionType =
  | string
  | SignaturePayloadDefinitionTypeMeta;

export function getSignaturePayloadDefinitionType(item: SignaturePayloadDefinitionType): string | null {
  if (item == null) return null;
  if (typeof item === 'object') return item.type;
  return item;
}

export interface SignaturePayloadDefinitionArg {
  label: string;
  type?: SignaturePayloadDefinitionType;
  types?: SignaturePayloadDefinitionType[];
  opt?: boolean;
  default?: SignatureDefinitionFunctionArgDefault;
}

export interface SignaturePayloadDefinition {
  type: SignaturePayloadDefinitionType;
  isProtected?: boolean;
  description?: string;
  example?: string[];
  variations?: Variation[];
}

export interface SignaturePayloadDefinitionFunction
  extends SignaturePayloadDefinition {
  arguments?: SignaturePayloadDefinitionArg[];
  returns: SignaturePayloadDefinitionType[];
  returnVariations?: Variation[];
}

export type SignaturePayloadDefinitionContainer = {
  [key: string]:
  | SignaturePayloadDefinitionFunction
  | SignaturePayloadDefinition;
};

export interface SignaturePayload {
  type: string;
  extends?: string;
  hidden?: boolean;
  definitions: SignaturePayloadDefinitionContainer;
}
