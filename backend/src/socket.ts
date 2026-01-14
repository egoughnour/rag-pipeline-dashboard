import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { config } from './config.js'

let io: Server | null = null

export function initializeSocket(server: HttpServer): Server {
  io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  })

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`)

    // Handle joining pipeline rooms for real-time updates
    socket.on('subscribe:pipeline', (pipelineId: string) => {
      socket.join(`pipeline:${pipelineId}`)
      console.log(`Client ${socket.id} subscribed to pipeline ${pipelineId}`)
    })

    socket.on('unsubscribe:pipeline', (pipelineId: string) => {
      socket.leave(`pipeline:${pipelineId}`)
      console.log(`Client ${socket.id} unsubscribed from pipeline ${pipelineId}`)
    })

    // Handle joining dashboard room for global updates
    socket.on('subscribe:dashboard', () => {
      socket.join('dashboard')
      console.log(`Client ${socket.id} subscribed to dashboard`)
    })

    socket.on('unsubscribe:dashboard', () => {
      socket.leave('dashboard')
      console.log(`Client ${socket.id} unsubscribed from dashboard`)
    })

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id} (${reason})`)
    })

    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error)
    })
  })

  return io
}

export function getSocketIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized')
  }
  return io
}

// Helper functions for emitting events
export function emitToAll(event: string, data: unknown): void {
  if (!io) return
  io.emit(event, data)
}

export function emitToPipeline(pipelineId: string, event: string, data: unknown): void {
  if (!io) return
  io.to(`pipeline:${pipelineId}`).emit(event, data)
}

export function emitToDashboard(event: string, data: unknown): void {
  if (!io) return
  io.to('dashboard').emit(event, data)
}
