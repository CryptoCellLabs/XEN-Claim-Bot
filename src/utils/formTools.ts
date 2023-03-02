/**
 * Get the file extension
 * @example xxx.csv => csv, yyy.MP4 => mp4
 * @param filename
 */
export const getFileExtension = (filename: string): string => {
    const parts = filename.split('.')
    return parts[parts.length - 1].toLowerCase()
}

/**
 * Check a string is valid wallet address or not
 * @example 0xA54Db40B529dBd51c32c6F944f043aC0E7Bd47C3 => true, 78A54Db40B529dBd51c32c6F944f043aC0E7Bd47C3 => false
 * @param address
 */
export const isValidWalletAddress = (address: string): boolean => {
    return /^(0x)[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Check a string is valid wallet private key or not
 * @param key
 */
export const isValidWalletPrivateKey = (key: string): boolean => {
    return /^(0x)[a-fA-F0-9]{64}$/.test(key)
}
