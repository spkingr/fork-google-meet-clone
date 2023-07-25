import type { App } from 'vue'
import { createApp } from 'vue'
import Message from '~/components/Message.vue'

export type MessageType = 'success' | 'error' | 'warning' | 'info'

const Field: MessageType[] = ['success', 'error', 'warning', 'info']

export interface Options {
  content: string
  type?: MessageType
  close?: boolean
  duration?: number
}

type MessageFunction = (props: Options) => void

export const mountMessage: MessageFunction = (props: Options) => {
  const messageInstance = createApp(Message, { ...props }) // 第二个参数是传给root组件的props
  showMessage(messageInstance, props.duration)
}

// 改为用Record类型来声明 mountMessage 来自gpt的方案
const mountedMessages: Record<MessageType, MessageFunction> = {} as Record<
  MessageType,
  MessageFunction
>

Field.forEach((type: MessageType) => {
  mountedMessages[type] = (props: Options) => {
    props.type = type
    return mountMessage(props)
  }
})

function showMessage(app: App, durantion = 3000) {
  const fragment = document.createDocumentFragment()
  app.mount(fragment)
  document.body.appendChild(fragment)

  setTimeout(() => {
    app.unmount() // 销毁实例
  }, durantion)
}

export const useMessage = mountedMessages
