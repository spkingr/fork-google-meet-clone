// 实现一个Writable 类型
export type Writable<T> = {
  -readonly [P in keyof T]: T[P]
}
