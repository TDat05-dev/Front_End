import { auth, clearAuth, saveAuth } from '../auth/auth'

const SOCKET_URL = 'wss://chat.longapp.io.vn/chat/chat'
const RECONNECT_DELAY = 2000
const REQUEST_TIMEOUT = 10000

export interface SocketResponse<T = unknown> {
  event: string
  status: 'success' | 'error'
  data?: T
  mes?: string
}

type Listener = (res: SocketResponse) => void

let socket: WebSocket | null = null
let manualClose = false
let reLoggingIn = false
let loginUser: string | null = null
const queue: string[] = []
const listeners = new Map<string, Set<Listener>>()

export function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return
  }

  manualClose = false
  socket = new WebSocket(SOCKET_URL)

  socket.onopen = () => {
    if (auth.isAuthenticated) {
      reLogin()
    } else {
      flushQueue()
    }
  }

  socket.onmessage = (e) => {
    let res: SocketResponse
    try {
      res = JSON.parse(e.data)
    } catch {
      return
    }
    updateAuth(res)
    listeners.get(res.event)?.forEach((listener) => listener(res))
  }

  socket.onclose = () => {
    socket = null
    if (!manualClose) {
      setTimeout(connect, RECONNECT_DELAY)
    }
  }
}

export function disconnect() {
  manualClose = true
  socket?.close()
  socket = null
}

function reLogin() {
  reLoggingIn = true
  socket?.send(JSON.stringify({
    action: 'onchat',
    data: { event: 'RE_LOGIN', data: { user: auth.user, code: auth.reLoginCode } },
  }))
}

function flushQueue() {
  while (queue.length > 0 && socket?.readyState === WebSocket.OPEN) {
    socket.send(queue.shift()!)
  }
}

function updateAuth(res: SocketResponse) {
  const code = (res.data as { RE_LOGIN_CODE?: string } | undefined)?.RE_LOGIN_CODE

  if (res.event === 'LOGIN' && res.status === 'success' && loginUser && code) {
    saveAuth(loginUser, code)
  }

  if (res.event === 'RE_LOGIN') {
    if (res.status === 'success' && auth.user && code) {
      saveAuth(auth.user, code)
    } else {
      clearAuth()
    }
    reLoggingIn = false
    flushQueue()
  }

  if (res.event === 'AUTH' && res.status === 'error' && auth.isAuthenticated && !reLoggingIn) {
    reLogin()
  }

  if (res.event === 'LOGOUT') {
    clearAuth()
  }
}

export function send(event: string, data: object = {}) {
  if (event === 'LOGIN') {
    loginUser = (data as { user?: string }).user ?? null
  }

  const message = JSON.stringify({ action: 'onchat', data: { event, data } })
  if (socket && socket.readyState === WebSocket.OPEN && !reLoggingIn) {
    socket.send(message)
  } else {
    queue.push(message)
    if (!socket) connect()
  }
}

export function on(event: string, listener: Listener) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set())
  }
  listeners.get(event)!.add(listener)
  return () => {
    listeners.get(event)?.delete(listener)
  }
}

export function request<T = unknown>(event: string, data: object = {}, responseEvent = event) {
  return new Promise<SocketResponse<T>>((resolve, reject) => {
    const timer = setTimeout(() => {
      off()
      reject(new Error('Máy chủ không phản hồi'))
    }, REQUEST_TIMEOUT)

    const done = (res: SocketResponse) => {
      clearTimeout(timer)
      off()
      resolve(res as SocketResponse<T>)
    }
    const offResponse = on(responseEvent, done)
    const offAuth = on('AUTH', done)
    const off = () => {
      offResponse()
      offAuth()
    }

    send(event, data)
  })
}
