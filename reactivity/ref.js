import { trackEffects, triggerEffects } from "./effect.js"
import { toReactive } from './reactive.js';
import { createDep } from "./dep.js";
 
export function trackRefValue(ref) {
    trackEffects(ref.dep || (ref.dep = createDep()))
}

export function triggerRefValue(ref, newVal) {
    const dep = ref.dep
    if (dep) {
        triggerEffects(dep)
    }
  }

class RefImpl {
    constructor(value) {
        this._value = toReactive(value)
        this.dep = null
    }

    get value() {
        trackRefValue(this)
        return this._value
    }

    set value(newVal) {
        this._value = newVal
        triggerRefValue(this, newVal)
    }
}

export const ref = (rawValue) => {
    return new RefImpl(rawValue)
}