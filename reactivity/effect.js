import { createDep } from "./dep.js"

export let activeEffect = null

export class ReactiveEffect {
    constructor(fn) {
        this.fn = fn
    }
    run() {
        activeEffect = this
        this.fn()
    }
}

export function effect(fn) {
    const _effect = new ReactiveEffect(fn)
    _effect.run()
}


const targetMap = new WeakMap()
export function track(target, type, key) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
        depsMap.set(key, (dep = createDep()))
    }
    trackEffects(dep)
}

export function trigger(target,type,key,newValue, oldValue) {
    const depsMap = targetMap.get(target)
    if (!depsMap) {
        // never been tracked
        return
    }
    let deps = []
    deps.push(depsMap.get(key))
    const effects = []
    for (const dep of deps) {
      if (dep) {
        effects.push(...dep)
      }
    }
    triggerEffects(createDep(effects))
}

export function trackEffects(dep) {
    dep.add(activeEffect)
    // activeEffect.deps.push(dep)
}

export function triggerEffects(dep) {
    const effects = dep
    for (const effect of effects) {
        triggerEffect(effect)
    }
}

export function triggerEffect(effect) {
    effect.run()
}