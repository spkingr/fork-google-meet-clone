import type { createRoomModal, queryRoomModal } from './modals/live.modal'
import { request } from '~/http/index'

const PREFIX = '/live'

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
 * 2. 需要判断是否已经创建过房间 不过一般是uuid随机生成房间id
 */
export function createRoomApi(data: createRoomModal) {
  return request({
    url: `${PREFIX}/${liveEnum.ADDROOM}`,
    method: 'post',
    data,
  })
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
export function queryRoomApi(data: queryRoomModal) {
  return request({
    url: `${PREFIX}/${liveEnum.QUERYROOM}`,
    method: 'post',
    data,
  })
}
