import { hashSync, compareSync } from "bcrypt"

export const hash = ({plainText, salt_rounds = 12}={})=>{
    return hashSync(plainText, salt_rounds)
}

export const compare = ({plainText, cipherText}={})=>{
    return compareSync(plainText, cipherText)
}