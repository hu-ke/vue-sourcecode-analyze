import { baseHandlers } from "./baseHandlers.js"

export const toReactive = (value) => {
    if (typeof value !== 'object') {
        return value
    }
    const target = value
    const proxy = new Proxy(
        target,
        baseHandlers
    )
    return proxy
}
