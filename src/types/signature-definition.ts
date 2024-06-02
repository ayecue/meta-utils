export enum SignatureDefinitionBaseType {
  Function = 'function',
  Number = 'number',
  String = 'string',
  Map = 'map',
  List = 'list',
  Any = 'any',
  General = 'general'
}

export type SignatureDefinitionType = SignatureDefinitionBaseType | string;

export interface DescriptionContainerItem {
  description: string;
  example: string[] | null;
}

export interface SignatureDefinitionFunctionArgDefault {
  type: SignatureDefinitionBaseType.Number | SignatureDefinitionBaseType.String;
  value: number | string;
}
