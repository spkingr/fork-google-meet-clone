import { socket } from '~/plugins/socket'

export type Callback = (data: any) => void
export type Data = Record<string, any>

export interface IOnHanlders {
  MemberJoined: (callback: Callback) => void
  MemberLeft: (callback: Callback) => void
  MessageFromPeer: (callback: Callback) => void
  Joined: (callback: Callback) => void
  Heartbeat: (callback: Callback) => void
  RoomClosed: (callback: Callback) => void
}

export interface IEmitHanlders {
  MemberLeft: (data: Data) => void
  MessageToPeer: (data: Data) => void
  Heartbeat: (data: Data) => void
  Leave: (data: Data) => void
  CloseRoom: (data: Data) => void
}

export interface ICLIENT {
  id: string
  on: (event: keyof IOnHanlders, callback: Callback) => void
  emit: (event: keyof IEmitHanlders, data: Data) => void
  join: (data: Data) => void
}

const CLIENT: ICLIENT = {
  id: '',
  on: () => {},
  emit: () => {},
  join: () => {},
}

function addListeners() {
  /**
   * on 客户端进入房间
   * @param callback
   * @returns
   * @data  { type: 'self', memberId: <string> }
   */
  function OnJoined(callback: Callback) {
    socket.on('joined', (data: Data) => {
      callback({ ...data })
    })
  }

  /**
   * on 客户端进入房间
   * @param callback
   * @returns
   * @data  { type: 'broadcast', memberId: <string> }
   */
  function OnMemberJoined(callback: Callback) {
    socket.on('member-joined', (data: Data) => {
      const { memberId } = data
      if (memberId === CLIENT.id)
        return
      callback({ ...data })
    })
  }

  /**
   * on 客户端离开房间
   * @param callback
   * @returns
   * @data  { type: 'broadcast', memberId: <string> }
   */
  function OnMemberLeft(callback: Callback) {
    socket.on('member-left', (data: Data) => {
      callback({ ...data })
    })
  }

  /**
   * on 客户端发送消息
   * @param callback
   * @returns
   * @data  { type: 'offer' | 'answer' | 'candidate', memberId: <string> }
   */
  function OnMessageFromPeer(callback: Callback) {
    socket.on('message-from-peer', (data: Data) => {
      callback({ ...data })
    })
  }

  /**
   * on 房间关闭
   * @params callback
   * @returns
   * @data { }
   */
  function onRoomClosed(callback: Callback) {
    socket.on('room-closed', (data: Data) => {
      callback({ ...data })
    })
  }

  /**
   * on 心跳
   * @param callback
   * @returns
   * @data  { }
   */
  function onHeartBeat(callback: Callback) {
    socket.on('heartbeat', (data: Data) => {
      callback({ ...data })
    })
  }

  /* 整合到on事件 */
  const onHanlders: IOnHanlders = {
    MemberJoined: OnMemberJoined,
    MemberLeft: OnMemberLeft,
    MessageFromPeer: OnMessageFromPeer,
    Joined: OnJoined,
    Heartbeat: onHeartBeat,
    RoomClosed: onRoomClosed,
  }

  function on(event: keyof IOnHanlders, callback: Callback) {
    onHanlders[event](callback)
  }

  CLIENT.on = on
}

function addEmits() {
  /**
   * emit 用户离开房间
   * @param data
   * @returns
   * @data  { memberId: <string>, roomID: <string>, [any]: <any> }
   */
  function EmitMemberLeft(data: Data) {
    socket.emit('member-left', data)
  }

  /**
   * emit 用户发送消息
   * @param data
   * @returns
   * @data  {
   *    type: 'offer' | 'answer' | 'candidate',
   *    memberId: <string>,
   *    roomID: <string>,
   *    offer?: <any>,
   *    answer?: <any>,
   *    candidate?: <any>
   * }
   */
  function EmitMessageToPeer(data: Data) {
    socket.emit('message-to-peer', data)
  }

  /**
   * emit 心跳
   * @param data
   * @returns
   * @data  any
   */
  function emitHeartBeat(data: Data) {
    socket.emit('heartbeat', data)
  }

  /**
   * emit leave
   * @param data
   * @returns
   * @data any { memberId: <string>, roomID: <string> }
   */
  function emitLeave(data: Data) {
    socket.emit('leave', data)
  }

  /**
   * emit close room
   * @param data
   * @returns
   * @data any {memberId: <string>, roomID: <string>}
   */
  function emitCloseRoom(data: Data) {
    socket.emit('close-room', data)
  }

  const emitHanlders: IEmitHanlders = {
    MemberLeft: EmitMemberLeft,
    MessageToPeer: EmitMessageToPeer,
    Heartbeat: emitHeartBeat,
    Leave: emitLeave,
    CloseRoom: emitCloseRoom,
  }

  function emit(event: keyof IEmitHanlders, data: Data) {
    emitHanlders[event](data)
  }

  CLIENT.emit = emit
}

function addMethods() {
  addEmits()
  addListeners()

  // 本地用户专属join
  function Join(data: Data) {
    socket.emit('join', data)
  }
  CLIENT.join = Join
}

socket.on('connect', () => {
  /* 客户端id */
  CLIENT.id = socket.id

  /* 添加各种监听事件 */
  addMethods()
})

socket.on('disconnect', () => {
  console.warn('disconnect')
})

export {
  CLIENT,
}
