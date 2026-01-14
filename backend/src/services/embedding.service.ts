import OpenAI from 'openai'
import { config } from '../config.js'
import { query, transaction } from '../db/index.js'
import type { SearchResult, Chunk } from '../types/index.js'
import * as pipelineService from './pipeline.service.js'

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
})

interface ChunkRow {
  id: string
  document_id: string
  document_name: string
  content: string
  metadata: Record<string, unknown>
  similarity: string
}

export async function generateEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<number[]> {
  const response = await openai.embeddings.create({
    model,
    input: text,
  })

  return response.data[0].embedding
}

export async function createChunks(
  documentId: string,
  pipelineId: string,
  chunks: Array<{ content: string; metadata?: Record<string, unknown> }>,
  embeddingModel: string
): Promise<number> {
  const startTime = Date.now()

  return await transaction(async (client) => {
    let chunkIndex = 0

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content, embeddingModel)

      await client.query(
        `
        INSERT INTO chunks (document_id, pipeline_id, content, embedding, metadata, chunk_index)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [
          documentId,
          pipelineId,
          chunk.content,
          JSON.stringify(embedding),
          JSON.stringify(chunk.metadata || {}),
          chunkIndex,
        ]
      )

      chunkIndex++
    }

    // Record processing metrics
    const latency = Date.now() - startTime
    await pipelineService.recordMetric(pipelineId, 'documents_processed', 1)
    await pipelineService.recordMetric(pipelineId, 'avg_latency', latency)

    return chunkIndex
  })
}

export async function searchChunks(
  queryText: string,
  options: {
    pipelineId?: string
    limit?: number
  } = {}
): Promise<SearchResult[]> {
  const { pipelineId, limit = 20 } = options

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(queryText)

  let sql = `
    SELECT
      c.id,
      c.document_id,
      d.name as document_name,
      c.content,
      c.metadata,
      1 - (c.embedding <=> $1::vector) as similarity
    FROM chunks c
    JOIN documents d ON d.id = c.document_id
  `

  const values: unknown[] = [JSON.stringify(queryEmbedding)]

  if (pipelineId) {
    sql += ` WHERE c.pipeline_id = $2`
    values.push(pipelineId)
  }

  sql += `
    ORDER BY c.embedding <=> $1::vector
    LIMIT $${values.length + 1}
  `
  values.push(limit)

  const result = await query<ChunkRow>(sql, values)

  return result.rows.map((row) => ({
    id: row.id,
    documentId: row.document_id,
    documentName: row.document_name,
    content: row.content,
    score: parseFloat(row.similarity),
    metadata: row.metadata,
  }))
}

export async function deleteChunksByDocument(documentId: string): Promise<void> {
  await query('DELETE FROM chunks WHERE document_id = $1', [documentId])
}

export async function getChunkCount(pipelineId?: string): Promise<number> {
  let sql = 'SELECT COUNT(*) as count FROM chunks'
  const values: unknown[] = []

  if (pipelineId) {
    sql += ' WHERE pipeline_id = $1'
    values.push(pipelineId)
  }

  const result = await query<{ count: string }>(sql, values)
  return parseInt(result.rows[0].count, 10)
}
