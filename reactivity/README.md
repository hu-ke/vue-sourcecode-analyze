# vue响应式实现
## 一、vue中ref和effect结合使用
```
<script type="module">
  import { ref } from './ref.js'
  import { effect } from './effect.js'
  const a = ref(1)
  let dummy
  let calls = 0
  effect(() => {
    calls++
    dummy = a.value
  })
  console.log(calls, dummy) // 1 1
  a.value = 2
  console.log(calls, dummy) // 2 2
</script>
```
如何实现给a赋值时，effect的入参函数能够再被执行一遍呢？
## 二、实现
### 1.ref
调用ref时做了哪些事？
```
const a = ref(1)
```
#### a. 分析
1. 外部能够访问对象a的value属性（get value），get时会向袋子里添加一个订阅。
2. 可以给a的value属性赋值（set value），set时会触发所有订阅。
3. 需要有一个袋子来存放哪些事件订阅了它（dep）。
#### b. 实现
[](https://cdn.nlark.com/yuque/0/2023/png/22362293/1695278066974-1169d1b9-aa4c-4301-b5bf-e65f5fc633a5.png)
### 2.effect
#### a. 分析
调用effect函数做了哪些事？
```
effect(() => {
  call++
  dummy = a.value
})
console.log(calls, dummy); // 1 1
a.value = 2
console.log(calls, dummy); // 2 2
```
1. 传入的参数函数会被立即执行。
2. 执行过程中会读取a.value，产生一个订阅（ReactEffective）并被放入ref的袋子（dep）里。
3. a.value = 2之后会触发ref.dep里所有的订阅（ReactEffective）。
#### b. 实现
ReactiveEffect类：
```
export class ReactiveEffect {
    constructor(fn) {
        this.fn = fn
    }
    run() {
        activeEffect = this
        this.fn()
    }
}
```
effect函数：
```
export let activeEffect = null

export function effect(fn) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

export function trackEffects(dep) {
  dep.add(activeEffect)
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
```
到此为止，文章开头举的例子已经实现了。
那么问题来了，如果：ref入参是个对象呢？要求a.value.name = 'abc'时也能triggerEffects。
const a = ref({
  name: 'kk',
  gender: 'male'
})
### 3.toReactive
```
export const toReactive = (value) => {
    if (typeof value !== 'object') {
    return value
    }
    const target = value
    const proxy = new Proxy(target, baseHandler)
    return proxy
}
```
baseHandler:
```
export  const baseHandlers = {
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
```
