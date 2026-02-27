import { hashSync, compareSync } from "bcrypt"
import { SALT_ROUNDS } from "../../../../config/config.service.js"

export const hash = ({plainText, salt_rounds = SALT_ROUNDS }={})=>{
    return hashSync(plainText, salt_rounds)
}

export const compare = ({plainText, cipherText}={})=>{
    return compareSync(plainText, cipherText)
}