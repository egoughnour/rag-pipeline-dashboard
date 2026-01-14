import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { config, validateConfig } from './config.js'
import { pool } from './db/index.js'
import routes from './routes/index.js'
import { initializeSocket } from './socket.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

// Validate configuration
validateConfig()

// Create Express app
const app = express()
const server = createServer(app)

// Initialize Socket.IO
initializeSocket(server)

// Middleware
app.use(helmet())
app.use(cors({ origin: config.corsOrigin }))
app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API routes
app.use('/api', routes)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down gracefully...')

  server.close(() => {
    console.log('HTTP server closed')
  })

  await pool.end()
  console.log('Database pool closed')

  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

// Start server
server.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║       RAG Pipeline Dashboard Backend           ║
╠════════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(30)}  ║
║  Port:        ${config.port.toString().padEnd(30)}  ║
║  API:         http://localhost:${config.port}/api${' '.repeat(13)}║
╚════════════════════════════════════════════════╝
  `)
})

export default app
