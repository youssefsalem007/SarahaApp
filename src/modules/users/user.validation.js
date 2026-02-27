import joi from "joi";
import { GenderEnum } from "../../common/enum/user.enum.js";

export const signUpSchema = {
  body: joi
    .object({
      userName: joi.string().required(),
      email: joi.string().email().required(),
      password: joi.string().min(8).required(),
      cPassword: joi.string().required(),
      gender: joi
        .string()
        .valid(...Object.values(GenderEnum))
        .required(),
      age: joi.number().required(),
      phone: joi.string().required(),
    })
    .required()
    .messages({
      "any.required": "body must not be empty",
    }),
};

export const signInSchema = {
  body: joi
    .object({
      email: joi.string().required(),
      password: joi.string().min(6),
    })
    .required(),
};
