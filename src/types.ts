export interface DescriptionEntry {
  description: string;
  example?: string[];
}

export interface DescriptionContainer {
  $meta?: DescriptionEntry;
  [key: string]: DescriptionEntry;
}

export interface Descriptions {
  [key: string]: DescriptionContainer;
}

export interface SignatureDefinitionArg {
  label: string;
  type: string;
  opt?: boolean;
  default?: string;
}

export enum SignatureDefinitionType {
  Function = 'function',
  Property = 'property'
}

export interface SignatureDefinition {
  type: string;
  description?: string;
  example?: string[];
  isProtected?: boolean;
}

export interface SignatureFunctionDefinition extends SignatureDefinition {
  arguments?: SignatureDefinitionArg[];
  returns: string[];
}

export function isSignatureFunctionDefinition(value: Pick<SignatureDefinition, 'type'>): value is SignatureFunctionDefinition {
  return value.type === SignatureDefinitionType.Function;
}

export interface SignaturePropertyDefinition extends SignatureDefinition {
  valueTypes: string[];
}

export function isSignaturePropertyDefinition(value: Pick<SignatureDefinition, 'type'>): value is SignaturePropertyDefinition {
  return value.type === SignatureDefinitionType.Property;
}

export type SignatureDefinitionContainer = {
  [key: string]: SignatureFunctionDefinition | SignaturePropertyDefinition;
};

export interface Signature {
  type: string;
  definitions: SignatureDefinitionContainer;
}

export type EnrichContainerFunction = (
  type: string,
  container: SignatureDefinitionContainer,
  language?: string
) => SignatureDefinitionContainer;

export type GetDefinitionsFunction = (
  types: string[],
  language?: string
) => SignatureDefinitionContainer;
