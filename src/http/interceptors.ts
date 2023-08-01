import type { AxiosError, AxiosResponse } from 'axios'

export function reqResolve(config: any) {
  return config
}

export function reqReject(error: AxiosError) {
  return Promise.reject(error)
}

export function resResolve(response: AxiosResponse) {
  return response.data
}

export function resReject(error: AxiosError) {
  return Promise.reject(error)
}
