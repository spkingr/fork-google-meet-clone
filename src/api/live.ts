import type { createRoomModal, queryRoomModal } from './models/live.model'
import { createRequest } from './create'

const PREFIX = 'live'

const request = createRequest(PREFIX)

enum liveEnum {
  GETROOM = 'getRooms',
  ADDROOM = 'addRoom',
  DELETEROOM = 'deleteRoom',
  QUERYROOM = 'queryRoom',
}

/**
 * 创建房间
 * @param data.host_name 主持人名称
 * @param data.host_id 主持人id
 * @returns
 * @description
 * 1. 创建房间
 * 2. 返回房间信息
 */
export async function createRoomApi(data: createRoomModal) {
  const { data: res } = await request(
    liveEnum.ADDROOM,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  ).json()
  return res.value
}

/**
 * 查询房间是否存在
 * @param data.room_id 房间id
 * @returns null | room
 * @description
 * 1. 查询房间是否存在
 * 2. 存在返回房间信息
 * 3. 不存在返回null
 */
export async function queryRoomApi(data: queryRoomModal) {
  const { data: res } = await request(
    liveEnum.QUERYROOM,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  ).json()
  return res.value
}
