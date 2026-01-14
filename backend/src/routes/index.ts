import { Router } from 'express'
import pipelinesRouter from './pipelines.js'
import documentsRouter from './documents.js'
import searchRouter from './search.js'
import dashboardRouter from './dashboard.js'

const router = Router()

router.use('/pipelines', pipelinesRouter)
router.use('/documents', documentsRouter)
router.use('/search', searchRouter)
router.use('/dashboard', dashboardRouter)

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
