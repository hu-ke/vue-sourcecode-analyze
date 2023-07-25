export const baseHandlers = {
    set: (target, key, value, receiver) => {
        const result = Reflect.set(target, key, value, receiver)
        let oldValue = target[key]
        trigger(target, null, key, value, oldValue)
        return result
    },
    get: (target, key, receiver) => {
        const res = Reflect.get(target, key, receiver)
        track(target, null, key)
        return res
    }
}