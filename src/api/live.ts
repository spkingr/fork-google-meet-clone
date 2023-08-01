import type { createRoomModal } from './modals/live.modal'
import { request } from '~/http/index'

const PREFIX = '/live'

enum liveEnum {
  GETROOM = 'getRooms',
  ADDROOM = 'addRoom',
  DELETEROOM = 'deleteRoom',
  JOINROOM = 'joinRoom',
}

/**
 * 获取房间列表
 * @param params
 * @returns
 * @description
 * 1. 获取房间列表【不分页】
 */
export function getRoomsApi(params: createRoomModal) {
  return request({
    url: `${PREFIX}/${liveEnum.GETROOM}`,
    method: 'get',
    params,
  })
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
export function createRoomApi(data = {}) {
  return request({
    url: `${PREFIX}/${liveEnum.ADDROOM}`,
    method: 'post',
    data,
  })
}
