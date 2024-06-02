import { SignatureDefinitionType } from './signature-definition';

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
  keyType?: SignatureDefinitionType;
  valueType?: SignatureDefinitionType;
}

export type SignaturePayloadDefinitionType =
  | string
  | SignaturePayloadDefinitionTypeMeta;

export interface SignaturePayloadDefinitionArg {
  label: string;
  type: SignaturePayloadDefinitionType;
  opt?: boolean;
  default?: string;
}

export interface SignaturePayloadDefinition {
  type: SignaturePayloadDefinitionType;
  isProtected?: boolean;
  description?: string;
  example?: string[];
}

export interface SignaturePayloadDefinitionFunction
  extends SignaturePayloadDefinition {
  arguments?: SignaturePayloadDefinitionArg[];
  returns: SignaturePayloadDefinitionType[];
}

export type SignaturePayloadDefinitionContainer = {
  [key: string]:
    | SignaturePayloadDefinitionFunction
    | SignaturePayloadDefinition;
};

export interface SignaturePayload {
  type: string;
  extends?: string;
  definitions: SignaturePayloadDefinitionContainer;
}