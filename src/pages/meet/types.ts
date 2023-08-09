/* 会议用户 */
export interface User {
  name: string
  isHost: boolean
  [key: string]: any
}

/* 会议消息 */
export enum MessageTypeEnum {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
}
export interface Message {
  type: MessageTypeEnum
  content: string
  time: string
  name: string
}

/* 会议流控制按钮类型 */
export type ButtonType = 'audio' | 'video' | 'share'
