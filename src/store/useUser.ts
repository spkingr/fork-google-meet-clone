import { defineStore } from 'pinia'

interface User {
  name: string
  isHost: boolean
  __id__: string
  roomID: string
}

interface UserConfig {
  audio: boolean
  video: boolean
}

export const useUserStore = defineStore(
  'user',
  () => {
    // user 基本信息
    const user = ref<User>({
      name: '',
      isHost: false,
      __id__: '',
      roomID: '',
    })
    // user 自带配置
    const userConfig = ref<UserConfig>({
      audio: true,
      video: true,
    })

    function updateUser(newUser: User) {
      user.value = newUser
    }

    function modifyUser(modify: Partial<User>) {
      user.value = {
        ...user.value,
        ...modify,
      }
    }

    function updateUserConfig(newUserConfig: UserConfig) {
      userConfig.value = newUserConfig
    }

    function modifyUserConfig(modify: Partial<UserConfig>) {
      userConfig.value = {
        ...userConfig.value,
        ...modify,
      }
    }

    function clearUser() {
      user.value = {
        name: '',
        isHost: false,
        __id__: '',
        roomID: '',
      }

      userConfig.value = {
        audio: true,
        video: true,
      }
    }

    function isInRoom() {
      return user.value.roomID
    }

    return {
      user,
      userConfig,
      modifyUser,
      updateUser,
      clearUser,
      updateUserConfig,
      modifyUserConfig,
      isInRoom,
    }
  },
  {
    persist: true,
  },
)
