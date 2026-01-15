import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { pool } from '../../src/db/index.js'
import pipelinesRouter from '../../src/routes/pipelines.js'

// Set up test app
const app = express()
app.use(express.json())
app.use('/api/pipelines', pipelinesRouter)

describe('Pipelines API', () => {
  // Skip if no database connection
  const skipIfNoDb = process.env.DATABASE_URL ? describe : describe.skip

  skipIfNoDb('with database', () => {
    let testPipelineId: string

    beforeAll(async () => {
      // Ensure tables exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pipelines (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          status VARCHAR(20) NOT NULL DEFAULT 'paused',
          config JSONB NOT NULL DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
          name VARCHAR(500),
          mime_type VARCHAR(100),
          size BIGINT,
          status VARCHAR(20),
          uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS activities (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type VARCHAR(50),
          message TEXT,
          pipeline_id UUID,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)

      await pool.query(`
        CREATE TABLE IF NOT EXISTS metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          pipeline_id UUID,
          metric_type VARCHAR(50),
          value NUMERIC,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `)
    })

    afterAll(async () => {
      // Clean up test data
      if (testPipelineId) {
        await pool.query('DELETE FROM pipelines WHERE id = $1', [testPipelineId])
      }
      await pool.end()
    })

    beforeEach(async () => {
      // Clean up any test pipelines
      await pool.query("DELETE FROM pipelines WHERE name LIKE 'Test%'")
    })

    describe('POST /api/pipelines', () => {
      it('should create a new pipeline', async () => {
        const response = await request(app)
          .post('/api/pipelines')
          .send({
            name: 'Test Pipeline',
            description: 'A test pipeline',
            config: {
              chunkSize: 512,
              chunkOverlap: 50,
              embeddingModel: 'text-embedding-3-small',
              sourceType: 'file',
            },
          })

        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty('id')
        expect(response.body.name).toBe('Test Pipeline')
        expect(response.body.status).toBe('paused')

        testPipelineId = response.body.id
      })

      it('should validate required fields', async () => {
        const response = await request(app)
          .post('/api/pipelines')
          .send({
            // Missing name
            config: {
              chunkSize: 512,
              chunkOverlap: 50,
              embeddingModel: 'text-embedding-3-small',
              sourceType: 'file',
            },
          })

        expect(response.status).toBe(400)
      })

      it('should validate config schema', async () => {
        const response = await request(app)
          .post('/api/pipelines')
          .send({
            name: 'Test Pipeline',
            config: {
              chunkSize: 50, // Too small, min is 100
              chunkOverlap: 50,
              embeddingModel: 'test',
              sourceType: 'file',
            },
          })

        expect(response.status).toBe(400)
      })
    })

    describe('GET /api/pipelines', () => {
      it('should return list of pipelines', async () => {
        // Create a test pipeline first
        await request(app)
          .post('/api/pipelines')
          .send({
            name: 'Test List Pipeline',
            config: {
              chunkSize: 512,
              chunkOverlap: 50,
              embeddingModel: 'text-embedding-3-small',
              sourceType: 'file',
            },
          })

        const response = await request(app).get('/api/pipelines')

        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
      })
    })

    describe('GET /api/pipelines/:id', () => {
      it('should return 404 for non-existent pipeline', async () => {
        const response = await request(app).get(
          '/api/pipelines/00000000-0000-0000-0000-000000000000'
        )

        expect(response.status).toBe(404)
      })
    })
  })

  // Tests that don't require database
  describe('validation', () => {
    it('should reject invalid sourceType', async () => {
      const response = await request(app)
        .post('/api/pipelines')
        .send({
          name: 'Test',
          config: {
            chunkSize: 512,
            chunkOverlap: 50,
            embeddingModel: 'test',
            sourceType: 'invalid',
          },
        })

      expect(response.status).toBe(400)
    })
  })
})
