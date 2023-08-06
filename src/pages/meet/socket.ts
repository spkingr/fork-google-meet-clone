import { socket } from '~/plugins/socket'

export type Callback = (data: any) => void
export type Data = Record<string, any>

export interface IOnHanlders {
  MemberJoined: (callback: Callback) => void
  MemberLeft: (callback: Callback) => void
  MessageFromPeer: (callback: Callback) => void
  Joined: (callback: Callback) => void
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

  /* 整合到on事件 */
  const onHanlders: IOnHanlders = {
    MemberJoined: OnMemberJoined,
    MemberLeft: OnMemberLeft,
    MessageFromPeer: OnMessageFromPeer,
    Joined: OnJoined,
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
   * @data  { memberId: <string>, any: any }
   */
  function EmitMemberLeft(data: Data) {
    socket.emit('member-left', data)
  }

  /**
   * emit 用户离开房间
   * @param data
   * @returns
   * @data  { memberId: <string>, any: any }
   */
  function EmitMemberJoined(data: Data) {
    socket.emit('member-joined', data)
  }

  /**
   * emit 用户离开房间
   * @param data
   * @returns
   * @data  {
   *    type: 'offer' | 'answer' | 'candidate',
   *    memberId: <string>,
   *    offer: any,
   *    answer: any,
   *    candidate: any
   * }
   */
  function EmitMessageToPeer(data: Data) {
    console.log('socket emit', data.type)
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
  console.log('id', socket.id)

  /* 添加各种监听事件 */
  addMethods()
})

socket.on('disconnect', () => {
  console.warn('disconnect')
})

export {
  CLIENT,
}
