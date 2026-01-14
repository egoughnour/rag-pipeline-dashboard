import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket'],
      autoConnect: true,
    })

    socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
    })
  }

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Event types
export interface PipelineStatusEvent {
  pipelineId: string
  status: 'active' | 'paused' | 'error'
  message?: string
}

export interface DocumentProgressEvent {
  documentId: string
  pipelineId: string
  status: 'processing' | 'indexed' | 'error'
  progress?: number
  message?: string
}

export interface MetricsUpdateEvent {
  pipelineId: string
  documentsProcessed: number
  avgLatency: number
  errorRate: number
}
