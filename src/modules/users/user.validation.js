import joi from "joi";
import { GenderEnum } from "../../common/enum/user.enum.js";
import { general_rules } from "../../common/utils/generalRules.js";

export const signUpSchema = {
  body: joi
    .object({
      userName: joi.string().min(5).required(),
      email: general_rules.email.required(),
      password: general_rules.password.required(),
      cPassword: general_rules.cPassword.required(),
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

  // file: joi.object({
  //   attachment: joi
  //     .array()
  //     .max(1)
  //     .items(general_rules.file.required())
  //     .required(),
  //   attachments: joi
  //     .array()
  //     .max(3)
  //     .items(general_rules.file.required())
  //     .required(),
  // }),
};

export const signInSchema = {
  body: joi
    .object({
      email: joi.string().required(),
      password: joi.string().min(6),
    })
    .required(),
};

export const shareProfileSchema = {
  params: joi
    .object({
      id: general_rules.id.required(),
    })
    .required(),
};

export const updateProfileSchema = {
  body: joi
    .object({
      firstName: joi.string().min(5),
      lastName: joi.string().min(5),
      gender: joi.string().valid(...Object.values(GenderEnum)),
      phone: joi.string(),
    })
    .required(),
};

export const updatePasswordSchema = {
  body: joi
    .object({
      newPassword: general_rules.password.required(),
      cPassword: joi.string().valid(joi.ref("newPassword")),
      oldPassword: general_rules.password.required(),
    })
    .required(),
};
