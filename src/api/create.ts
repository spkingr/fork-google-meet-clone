import { createFetch } from '@vueuse/core'

const URL = import.meta.env.VITE_BASE_URL

export function createRequest(prefix: string) {
  const REQUEST_ROUTER = `${URL}/${prefix}/`
  return createFetch({
    baseUrl: REQUEST_ROUTER,
    options: {
      afterFetch({ response, data }) {
        if (!response.ok)
          useMessage.error({ content: '请求失败' })
        return { data, response }
      },
    },
    fetchOptions: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  })
}
