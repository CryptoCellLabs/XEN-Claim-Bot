/**
 * Determine whether the device is a desktop
 */
export const isDesktop = (): boolean => {
    const userAgent = navigator.userAgent.toLowerCase()
    return userAgent.indexOf('windows') !== -1
        || userAgent.indexOf('macintosh') !== -1
        || userAgent.indexOf('linux') !== -1
}
