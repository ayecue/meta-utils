import Joi from 'joi';
import { SignatureDefinitionBaseType } from './types/signature-definition';

export const signatureDefinitionTypeSchema = Joi.alternatives(
  Joi.string(),
  Joi.object({
    type: Joi.string().required(),
    keyType: Joi.string().optional(),
    valueType: Joi.string().optional(),
  })
);

export const signatureDefinitionFunctionSchemaArgDefaultString = Joi.object({
  type: Joi.string().valid(SignatureDefinitionBaseType.String).required(),
  value: Joi.string().allow('').required()
});

export const signatureDefinitionFunctionSchemaArgDefaultNumber = Joi.object({
  type: Joi.string().valid(SignatureDefinitionBaseType.Number).required(),
  value: Joi.number().required()
});

export const signatureDefinitionFunctionSchemaArgMultiTypes = Joi.object({
  label: Joi.string().required(),
  types: Joi.array().items(signatureDefinitionTypeSchema).required(),
  opt: Joi.boolean().optional(),
  default: Joi.alternatives(
    signatureDefinitionFunctionSchemaArgDefaultString,
    signatureDefinitionFunctionSchemaArgDefaultNumber
  ).optional()
});

export const signatureDefinitionFunctionSchemaArg = Joi.object({
  label: Joi.string().required(),
  type: signatureDefinitionTypeSchema.required(),
  opt: Joi.boolean().optional(),
  default: Joi.alternatives(
    signatureDefinitionFunctionSchemaArgDefaultString,
    signatureDefinitionFunctionSchemaArgDefaultNumber
  ).optional()
});

export const signatureDefinitionFunctionSchema = Joi.object({
  type: Joi.string().valid(SignatureDefinitionBaseType.Function).required(),
  description: Joi.string().optional(),
  example: Joi.string().optional(),
  isProtected: Joi.boolean().optional(),
  arguments: Joi.array()
    .items(Joi.alternatives(
      signatureDefinitionFunctionSchemaArg,
      signatureDefinitionFunctionSchemaArgMultiTypes
    ))
    .optional(),
  returns: Joi.array().items(signatureDefinitionTypeSchema).required()
});

export const signatureDefinitionSchema = Joi.object({
  type: signatureDefinitionTypeSchema.invalid(SignatureDefinitionBaseType.Function).required(),
  description: Joi.string().optional(),
  example: Joi.string().optional(),
  isProtected: Joi.boolean().optional()
});

export const signatureDefinitionContainerSchema = Joi.object().pattern(
  Joi.string(),
  Joi.alternatives(
    signatureDefinitionFunctionSchema,
    signatureDefinitionSchema
  )
);

export const descriptionContainerSchema = Joi.object({
  $meta: Joi.object({
    description: Joi.string().required(),
    example: Joi.array().items(Joi.string()).optional()
  }).optional()
}).pattern(
  Joi.string(),
  Joi.object({
    description: Joi.string().required(),
    example: Joi.array().items(Joi.string()).optional()
  })
);
