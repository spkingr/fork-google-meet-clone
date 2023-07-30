import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL!

const socket = io(SOCKET_URL)

socket.on('connect', () => {
  // eslint-disable-next-line no-console
  console.log('--- Connected to server ---')
})
