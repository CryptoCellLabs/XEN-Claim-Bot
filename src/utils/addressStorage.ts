import { AESEncrypt, AESDecrypt } from '@/utils/encrypt'

const addressStorageKey = 'CLAIM_ADDRESSES'
const addressStorageSecret = 'CLAIM_BOT'

export const setAddressStorage = (val: ClaimTableAddressItem[]) => {
    window.localStorage.setItem(addressStorageKey, val && val.length ? AESEncrypt(JSON.stringify(val), addressStorageSecret) : '')
}

export const getAddressStorage = () => {
    const res = window.localStorage.getItem(addressStorageKey)
    return res ? JSON.parse(AESDecrypt(res, addressStorageSecret)) : null
}

export const clearAddressStorage = () => {
    window.localStorage.removeItem(addressStorageKey)
}
