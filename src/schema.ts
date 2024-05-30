import Joi from 'joi';
import { SignatureDefinitionType } from './types';

export const signatureDefinitionContainerSchema = Joi.object().pattern(
  Joi.string(),
  Joi.alternatives(
    Joi.object({
      type: Joi.string().valid(SignatureDefinitionType.Function).required(),
      description: Joi.string().optional(),
      example: Joi.string().optional(),
      isProtected: Joi.boolean().optional(),
      arguments: Joi.array()
        .items(
          Joi.object({
            label: Joi.string().required(),
            type: Joi.string().required(),
            opt: Joi.boolean().optional(),
            default: Joi.string().optional()
          })
        )
        .optional(),
      returns: Joi.array().items(Joi.string()).required()
    }),
    Joi.object({
      type: Joi.string().valid(SignatureDefinitionType.Property).required(),
      description: Joi.string().optional(),
      example: Joi.string().optional(),
      isProtected: Joi.boolean().optional(),
      valueTypes: Joi.array().items(Joi.string()).required()
    })
  )
);
