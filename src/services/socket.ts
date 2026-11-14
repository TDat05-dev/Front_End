import { auth, clearAuth, saveAuth } from '../auth/auth'

const SOCKET_URL = 'wss://chat.longapp.io.vn/chat/chat'
const RETRY_BASE_DELAY = 2000
const RETRY_MAX_DELAY = 30000
const REQUEST_TIMEOUT = 10000

export interface SocketResponse<T = unknown> {
  event: string
  status: 'success' | 'error'
  data?: T
  mes?: string
}

export type ConnectionState = 'idle' | 'connecting' | 'online' | 'reconnecting' | 'offline'

export interface ConnectionStatus {
  state: ConnectionState
  retryAt: number | null
  retryDelay: number
}

type Listener = (res: SocketResponse) => void

let socket: WebSocket | null = null
let manualClose = false
let reLoggingIn = false
let loginUser: string | null = null
let retryCount = 0
let retryTimer: ReturnType<typeof setTimeout> | null = null
let status: ConnectionStatus = { state: 'idle', retryAt: null, retryDelay: 0 }
const queue: string[] = []
const listeners = new Map<string, Set<Listener>>()
const statusListeners = new Set<() => void>()

function setStatus(state: ConnectionState, retryDelay = 0) {
  status = { state, retryAt: retryDelay ? Date.now() + retryDelay : null, retryDelay }
  statusListeners.forEach((listener) => listener())
}

export function getStatus() {
  return status
}

export function onStatusChange(listener: () => void) {
  statusListeners.add(listener)
  return () => {
    statusListeners.delete(listener)
  }
}

export function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return
  }
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = null
  }

  manualClose = false
  if (status.state === 'idle') setStatus('connecting')
  socket = new WebSocket(SOCKET_URL)

  socket.onopen = () => {
    retryCount = 0
    setStatus('online')
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
    reLoggingIn = false
    if (!manualClose) scheduleRetry()
  }
}

function scheduleRetry() {
  if (!navigator.onLine) {
    setStatus('offline')
    return
  }
  const delay = Math.min(RETRY_BASE_DELAY * 2 ** retryCount, RETRY_MAX_DELAY)
  retryCount++
  setStatus('reconnecting', delay)
  retryTimer = setTimeout(connect, delay)
}

export function reconnectNow() {
  retryCount = 0
  connect()
}

export function disconnect() {
  manualClose = true
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = null
  }
  socket?.close()
  socket = null
  setStatus('idle')
}

window.addEventListener('online', () => {
  if (status.state === 'offline' || status.state === 'reconnecting') reconnectNow()
})

window.addEventListener('offline', () => {
  if (status.state !== 'idle') setStatus('offline')
})

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
    if (!socket && status.state !== 'reconnecting' && status.state !== 'offline') connect()
  }
  return message
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
      const index = queue.indexOf(message)
      if (index !== -1) queue.splice(index, 1)
      reject(new Error(status.state === 'online' ? 'Máy chủ không phản hồi' : 'Mất kết nối tới máy chủ'))
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

    const message = send(event, data)
  })
}
