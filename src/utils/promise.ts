/**
 * Sleep specified time
 * @param milliseconds
 */
export const sleep = (milliseconds: number) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

/**
 * Promise wrapper, wait to mode
 * @param { Promise } promise
 * @param { Object= } errorExt - Additional Information you can pass to the err object
 * @return { Promise }
 */
export const waitTo = <T, U = Error>(
    promise: Promise<T>,
    errorExt?: object
): Promise<[U, undefined] | [null, T]> => {
    return promise
        .then<[null, T]>((data: T) => [null, data])
        .catch<[U, undefined]>((err: U) => {
            if (errorExt) {
                const parsedError = Object.assign({}, err, errorExt)
                return [parsedError, undefined]
            }

            return [err, undefined]
        })
}
