import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { z } from 'zod'
import * as pipelineService from '../services/pipeline.service.js'

const router = Router()

const pipelineConfigSchema = z.object({
  chunkSize: z.number().min(100).max(4000),
  chunkOverlap: z.number().min(0).max(500),
  embeddingModel: z.string(),
  sourceType: z.enum(['file', 'url', 's3']),
  s3Bucket: z.string().optional(),
  s3Prefix: z.string().optional(),
})

const createPipelineSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  config: pipelineConfigSchema,
})

const updatePipelineSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  config: pipelineConfigSchema.partial().optional(),
})

// GET /api/pipelines - List all pipelines
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pipelines = await pipelineService.getAllPipelines()
    res.json(pipelines)
  })
)

// GET /api/pipelines/:id - Get single pipeline
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const pipeline = await pipelineService.getPipelineById(req.params.id)

    if (!pipeline) {
      res.status(404).json({ error: 'Pipeline not found' })
      return
    }

    res.json(pipeline)
  })
)

// POST /api/pipelines - Create pipeline
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = createPipelineSchema.parse(req.body)
    const pipeline = await pipelineService.createPipeline(data)
    res.status(201).json(pipeline)
  })
)

// PATCH /api/pipelines/:id - Update pipeline
router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = updatePipelineSchema.parse(req.body)
    const pipeline = await pipelineService.updatePipeline(req.params.id, data)

    if (!pipeline) {
      res.status(404).json({ error: 'Pipeline not found' })
      return
    }

    res.json(pipeline)
  })
)

// DELETE /api/pipelines/:id - Delete pipeline
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const deleted = await pipelineService.deletePipeline(req.params.id)

    if (!deleted) {
      res.status(404).json({ error: 'Pipeline not found' })
      return
    }

    res.status(204).send()
  })
)

// POST /api/pipelines/:id/start - Start pipeline
router.post(
  '/:id/start',
  asyncHandler(async (req, res) => {
    const pipeline = await pipelineService.startPipeline(req.params.id)

    if (!pipeline) {
      res.status(404).json({ error: 'Pipeline not found' })
      return
    }

    res.json(pipeline)
  })
)

// POST /api/pipelines/:id/stop - Stop pipeline
router.post(
  '/:id/stop',
  asyncHandler(async (req, res) => {
    const pipeline = await pipelineService.stopPipeline(req.params.id)

    if (!pipeline) {
      res.status(404).json({ error: 'Pipeline not found' })
      return
    }

    res.json(pipeline)
  })
)

// GET /api/pipelines/:id/metrics - Get pipeline metrics
router.get(
  '/:id/metrics',
  asyncHandler(async (req, res) => {
    const hours = parseInt(req.query.hours as string) || 24
    const metrics = await pipelineService.getPipelineMetrics(req.params.id, hours)
    res.json(metrics)
  })
)

export default router
