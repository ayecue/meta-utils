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

export interface SignatureDefinition {
  arguments?: SignatureDefinitionArg[];
  returns: string[];
  description?: string;
  example?: string[];
}

export type SignatureDefinitionContainer = {
  [key: string]: SignatureDefinition;
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
