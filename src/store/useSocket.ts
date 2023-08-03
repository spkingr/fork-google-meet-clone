import { defineStore } from 'pinia'
import { socket } from '~/plugins/socket'

export type Callback = (data: any) => void
export type Data = Record<string, any>

export interface IOnHanlders {
  MemberJoined: (callback: Callback) => void
  MemberLeft: (callback: Callback) => void
  MessageFromPeer: (callback: Callback) => void
}

export interface IEmitHanlders {
  MemberLeft: (data: Data) => void
  MemberJoined: (data: Data) => void
  MessageToPeer: (data: Data) => void
}

export interface ICLIENT {
  id: string
  on: (event: keyof IOnHanlders, callback: Callback) => void
  emit: (event: keyof IEmitHanlders, data: Data) => void
  join: (data: Data) => void
}

export const useSocketStore = defineStore(
  'socket',
  () => {
    const CLIENT: ICLIENT = {
      id: '',
      on: () => {},
      emit: () => {},
      join: () => {},
    }

    async function run() {
      return new Promise((resolve) => {
        socket.on('connect', () => {
          /* 客户端id */
          CLIENT.id = socket.id

          // ----------------------------------------------------------------------------------
          /* 任意用户加入 */
          function OnMemberJoined(callback: Callback) {
            socket.on('member-joined', (data: Data) => {
              callback({ ...data, memberId: socket.id })
            })
          }

          /* on 客户端离开房间 */
          function OnMemberLeft(callback: Callback) {
            socket.on('member-left', (data: Data) => {
              callback({ ...data, memberId: socket.id })
            })
          }

          /* on 监听其他端的消息 */
          function OnMessageFromPeer(callback: Callback) {
            socket.on('message-from-peer', (data: Data) => {
              callback({ ...data, memberId: socket.id })
            })
          }

          /* 整合到on事件 */
          const onHanlders: IOnHanlders = {
            MemberJoined: OnMemberJoined,
            MemberLeft: OnMemberLeft,
            MessageFromPeer: OnMessageFromPeer,
          }

          function on(event: keyof IOnHanlders, callback: Callback) {
            onHanlders[event](callback)
          }

          CLIENT.on = on
          // ----------------------------------------------------------------------------------

          // emit ----------------------------------------------------------------------------
          /* emit 监听用户离开房间 */
          function EmitMemberLeft(data: Data) {
            socket.emit('member-left', data)
          }

          /* emit 监听用户进入房间 */
          function EmitMemberJoined(data: Data) {
            socket.emit('member-joined', data)
          }

          /* emit 用户发送事件 */
          function EmitMessageToPeer(data: Data) {
            socket.emit('message-to-peer', data)
          }

          const emitHanlders: IEmitHanlders = {
            MemberLeft: EmitMemberLeft,
            MemberJoined: EmitMemberJoined,
            MessageToPeer: EmitMessageToPeer,
          }

          function emit(event: keyof IEmitHanlders, data: Data) {
            emitHanlders[event](data)
          }

          CLIENT.emit = emit
          // ----------------------------------------------------------------------------------

          // 本地用户加入-----------------------------------------------------------------------
          /* 本地用户加入 */
          function Join(data: Data) {
            socket.emit('join', data)
          }
          CLIENT.join = Join
          // -------------------------------------------------------------------------------

          resolve(true)
        })
      })
    }

    return {
      CLIENT, run,
    }
  },
)
