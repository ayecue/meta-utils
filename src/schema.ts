import Joi from 'joi';
import { SignatureDefinitionBaseType } from './types/signature-definition';

export const signatureDefinitionTypeSchema = Joi.alternatives(Joi.string(), Joi.object({
  type: Joi.string().required(),
  keyType: Joi.string().optional(),
  valueType: Joi.string().optional(),
}));

export const signatureDefinitionContainerSchema = Joi.object().pattern(
  Joi.string(),
  Joi.alternatives(
    Joi.object({
      type: Joi.string().valid(SignatureDefinitionBaseType.Function).required(),
      description: Joi.string().optional(),
      example: Joi.string().optional(),
      isProtected: Joi.boolean().optional(),
      arguments: Joi.array()
        .items(
          Joi.object({
            label: Joi.string().required(),
            type: signatureDefinitionTypeSchema.required(),
            opt: Joi.boolean().optional(),
            default: Joi.string().optional()
          })
        )
        .optional(),
      returns: Joi.array().items(signatureDefinitionTypeSchema).required()
    }),
    Joi.object({
      type: signatureDefinitionTypeSchema.required(),
      description: Joi.string().optional(),
      example: Joi.string().optional(),
      isProtected: Joi.boolean().optional()
    })
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
