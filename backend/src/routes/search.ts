import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { z } from 'zod'
import * as embeddingService from '../services/embedding.service.js'

const router = Router()

const searchSchema = z.object({
  query: z.string().min(1).max(1000),
  pipelineId: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).optional().default(20),
})

// POST /api/search - Semantic search
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { query, pipelineId, limit } = searchSchema.parse(req.body)

    const results = await embeddingService.searchChunks(query, {
      pipelineId,
      limit,
    })

    res.json(results)
  })
)

export default router
