import { socket } from '~/plugins/socket'

type Callback = (data: any) => void
type Data = Record<string, any>

interface IOnHanlders {
  MemberJoined: (callback: Callback) => void
  MemberLeft: (callback: Callback) => void
  MessageFromPeer: (callback: Callback) => void
}

interface IEmitHanlders {
  MemberJoined: (data: Data) => void
}

interface ICLIENT {
  id: string
  on: (event: keyof IOnHanlders, callback: Callback) => void
  emit: (event: keyof IEmitHanlders, data: Data) => void
}

const CLIENT: ICLIENT = {
  id: '',
  on: () => {},
  emit: () => {},
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
          callback(data)
        })
      }

      /* on 客户端离开房间 */
      function OnMemberLeft(callback: Callback) {
        socket.on('member-left', (data: Data) => {
          callback(data)
        })
      }

      /* on 监听其他端的消息 */
      function OnMessageFromPeer(callback: Callback) {
        socket.on('message-from-peer', (data: Data) => {
          callback(data)
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
      /* emit 监听用户进入房间 通知服务端 */
      function EmitMemberJoined(data: Data) {
        socket.emit('member-joined', data)
      }

      const emitHanlders: IEmitHanlders = {
        MemberJoined: EmitMemberJoined,
      }

      function emit(event: keyof IEmitHanlders, data: Data) {
        emitHanlders[event](data)
      }

      CLIENT.emit = emit
      // ----------------------------------------------------------------------------------

      resolve(true)
    })
  })
}

await run()

export { CLIENT }
