import { BigNumber, utils } from 'ethers'

/**
 * Format number less than 10
 * @param val
 */
export const fillZero = (val: number): string => {
    return +val < 10 ? `0${val}` : val.toString()
}

/**
 * Format Date time
 * @param val
 * @param formatString
 * @param isUTC
 */
export const dateFormatter = (val: any, formatString = 'yyyy-MM-dd hh:mm:ss', isUTC = false): string => {
    // Safari date time string format compatible
    const value = typeof val === 'string' ? val.replace(/-/g, '/') : val
    const date = new Date(value)
    const year = isUTC ? date.getUTCFullYear() : date.getFullYear()
    const month = (isUTC ? date.getUTCMonth() : date.getMonth()) + 1
    const day = isUTC ? date.getUTCDate() : date.getDate()
    const hours = isUTC ? date.getUTCHours() : date.getHours()
    const minutes = isUTC ? date.getUTCMinutes() : date.getMinutes()
    const second = isUTC ? date.getUTCSeconds() : date.getSeconds()
    const millisecond = isUTC ? date.getUTCMilliseconds() : date.getMilliseconds()
    return formatString.replace('yyyy', year.toString())
        .replace('MM', fillZero(month))
        .replace('M', month.toString())
        .replace('dd', fillZero(day))
        .replace('d', day.toString())
        .replace('hh', fillZero(hours))
        .replace('h', hours.toString())
        .replace('mm', fillZero(minutes))
        .replace('m', minutes.toString())
        .replace('ss', fillZero(second))
        .replace('s', second.toString())
        .replace('ms', millisecond.toString())
}

/**
 * Get date time diff from now
 * @param timestamp
 * @param format
 */
export const getDateTimeDiffFromNow = (timestamp: number, format = '{d} D {hh} H {mm} M'): string => {
    if (!timestamp) {
        return ''
    }
    const now = Date.now()
    const until = new Date(timestamp).getTime()
    let diff = until - now
    if (diff < 0) {
        diff = 0
    }
    const days = diff / 1000 / 3600 / 24
    const day = Math.floor(days)
    const showDay = day.toString() || ''
    const hours = (days - day) * 24
    const hour = Math.floor(hours)
    const showHour = fillZero(hour)
    const minutes = (hours - hour) * 60
    const minute = Math.floor(minutes)
    const showMinute = fillZero(minute)
    const seconds = (minutes - minute) * 60
    const second = Math.floor(seconds)
    const showSecond = fillZero(second)
    return format.replace('{d}', showDay)
        .replace('{h}', hour.toString())
        .replace('{hh}', showHour)
        .replace('{m}', minute.toString())
        .replace('{mm}', showMinute)
        .replace('{s}', second.toString())
        .replace('{ss}', showSecond)
}


/**
 * Get chain block explorer address link
 * @param str address or txHash
 * @param chain
 * @param type
 */
export const getBlockExplorerAddressLink = (str: string, chain: SupportedChain = 'eth', type: 'tx' | 'address' = 'address'): string => {
    const origin: Record<SupportedChain, string> = {
        eth: 'https://etherscan.io',
        goerli: 'https://goerli.etherscan.io'
    }
    return `${origin[chain]}/${type}/${str}`
}

/**
 * Get the name of the specified chain
 * @param chain
 */
export const getChainName = (chain: SupportedChain = 'eth'): string => {
    const chainNameMap = {
        eth: 'Ethereum',
        goerli: 'Goerli'
    }
    return chainNameMap[chain] || ''
}

/**
 * Get the native token symbol of the specified chain
 * @param chain
 */
export const getChainNativeTokenSymbol = (chain: SupportedChain = 'eth'): string => {
    const chainTokenSymbolMap = {
        eth: 'ETH',
        goerli: 'GETH'
    }
    return chainTokenSymbolMap[chain] || ''
}

/**
 * Wallet Address short formatter
 * @example format 0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d to 0xbc4c...f13d
 * @param val
 */
export const shortWalletAddressFormatter = (val: string): string => {
    if (!val) {
        return ''
    }
    return val.slice(0, 6) + '...' + val.slice(val.length - 4)
}

/**
 * Truncate Number Decimal
 * @param num
 * @param digits
 */
export const truncateNumberDecimal = (num: number, digits: number): number => {
    const factor = Math.pow(10, digits);
    return Math.trunc(num * factor) / factor;
}

/**
 * Truncate Number String Decimal
 * @param numStr
 * @param digits
 */
export const truncateNumberStringDecimal = (numStr: string, digits: number): string => {
    const dotIndex = numStr.indexOf('.')
    if (dotIndex === -1) {
        return numStr
    }
    const numChars = numStr.split('')
    const numDigits = numChars.length - dotIndex - 1
    if (numDigits <= digits) {
        return numStr
    }
    const truncatedChars = numChars.slice(0, dotIndex + digits + 1)
    return truncatedChars.join('')
}

/**
 * Convert hex string to number string
 * @param hexString
 * @param digits
 */
export const hexStringToNumberString = (hexString: string, digits: number) => {
    return truncateNumberStringDecimal(utils.formatEther(BigNumber.from(hexString)), digits)
}
