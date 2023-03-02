import { AES, enc } from 'crypto-js'

/**
 * AES Encrypt
 * @param val
 * @param secret
 */
export const AESEncrypt = (val: string, secret: string) => {
    return AES.encrypt(val, secret).toString()
}

/**
 * AES Decrypt
 * @param val
 * @param secret
 */
export const AESDecrypt = (val: string, secret: string) => {
    const decrypt = AES.decrypt(val, secret)
    return decrypt.toString(enc.Utf8)
}
