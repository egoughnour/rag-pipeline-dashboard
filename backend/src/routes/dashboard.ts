import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import * as activityService from '../services/activity.service.js'
import * as embeddingService from '../services/embedding.service.js'

const router = Router()

// GET /api/dashboard/stats - Get dashboard stats
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const stats = await activityService.getDashboardStats()
    res.json(stats)
  })
)

// GET /api/dashboard/activity - Get recent activity
router.get(
  '/activity',
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20
    const activity = await activityService.getRecentActivity(limit)
    res.json(activity)
  })
)

export default router
