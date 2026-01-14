import { query, transaction } from '../db/index.js'
import type {
  Pipeline,
  PipelineConfig,
  CreatePipelineRequest,
  UpdatePipelineRequest,
  PipelineMetrics,
  MetricPoint,
} from '../types/index.js'

interface PipelineRow {
  id: string
  name: string
  description: string | null
  status: 'active' | 'paused' | 'error'
  config: PipelineConfig
  document_count: string
  created_at: Date
  updated_at: Date
}

interface MetricRow {
  value: string
  timestamp: Date
}

function mapRowToPipeline(row: PipelineRow): Pipeline {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    config: row.config,
    documentCount: parseInt(row.document_count || '0', 10),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getAllPipelines(): Promise<Pipeline[]> {
  const result = await query<PipelineRow>(`
    SELECT
      p.*,
      COUNT(d.id) as document_count
    FROM pipelines p
    LEFT JOIN documents d ON d.pipeline_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `)

  return result.rows.map(mapRowToPipeline)
}

export async function getPipelineById(id: string): Promise<Pipeline | null> {
  const result = await query<PipelineRow>(
    `
    SELECT
      p.*,
      COUNT(d.id) as document_count
    FROM pipelines p
    LEFT JOIN documents d ON d.pipeline_id = p.id
    WHERE p.id = $1
    GROUP BY p.id
  `,
    [id]
  )

  if (result.rows.length === 0) {
    return null
  }

  return mapRowToPipeline(result.rows[0])
}

export async function createPipeline(data: CreatePipelineRequest): Promise<Pipeline> {
  const result = await query<PipelineRow>(
    `
    INSERT INTO pipelines (name, description, config, status)
    VALUES ($1, $2, $3, 'paused')
    RETURNING *, 0 as document_count
  `,
    [data.name, data.description || null, JSON.stringify(data.config)]
  )

  // Log activity
  await query(
    `INSERT INTO activities (type, message, pipeline_id)
     VALUES ('pipeline_started', $1, $2)`,
    [`Pipeline "${data.name}" created`, result.rows[0].id]
  )

  return mapRowToPipeline(result.rows[0])
}

export async function updatePipeline(
  id: string,
  data: UpdatePipelineRequest
): Promise<Pipeline | null> {
  const updates: string[] = []
  const values: unknown[] = []
  let paramIndex = 1

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`)
    values.push(data.name)
  }

  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex++}`)
    values.push(data.description)
  }

  if (data.config !== undefined) {
    updates.push(`config = config || $${paramIndex++}::jsonb`)
    values.push(JSON.stringify(data.config))
  }

  if (updates.length === 0) {
    return getPipelineById(id)
  }

  values.push(id)

  const result = await query<PipelineRow>(
    `
    UPDATE pipelines
    SET ${updates.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *, (SELECT COUNT(*) FROM documents WHERE pipeline_id = pipelines.id) as document_count
  `,
    values
  )

  if (result.rows.length === 0) {
    return null
  }

  return mapRowToPipeline(result.rows[0])
}

export async function deletePipeline(id: string): Promise<boolean> {
  const result = await query('DELETE FROM pipelines WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}

export async function startPipeline(id: string): Promise<Pipeline | null> {
  const result = await query<PipelineRow>(
    `
    UPDATE pipelines
    SET status = 'active'
    WHERE id = $1
    RETURNING *, (SELECT COUNT(*) FROM documents WHERE pipeline_id = pipelines.id) as document_count
  `,
    [id]
  )

  if (result.rows.length === 0) {
    return null
  }

  // Log activity
  await query(
    `INSERT INTO activities (type, message, pipeline_id)
     VALUES ('pipeline_started', $1, $2)`,
    [`Pipeline "${result.rows[0].name}" started`, id]
  )

  return mapRowToPipeline(result.rows[0])
}

export async function stopPipeline(id: string): Promise<Pipeline | null> {
  const result = await query<PipelineRow>(
    `
    UPDATE pipelines
    SET status = 'paused'
    WHERE id = $1
    RETURNING *, (SELECT COUNT(*) FROM documents WHERE pipeline_id = pipelines.id) as document_count
  `,
    [id]
  )

  if (result.rows.length === 0) {
    return null
  }

  // Log activity
  await query(
    `INSERT INTO activities (type, message, pipeline_id)
     VALUES ('pipeline_stopped', $1, $2)`,
    [`Pipeline "${result.rows[0].name}" stopped`, id]
  )

  return mapRowToPipeline(result.rows[0])
}

export async function getPipelineMetrics(
  pipelineId: string,
  hours: number = 24
): Promise<PipelineMetrics> {
  const docsProcessed = await query<MetricRow>(
    `
    SELECT value, timestamp
    FROM metrics
    WHERE pipeline_id = $1 AND metric_type = 'documents_processed'
    AND timestamp > NOW() - INTERVAL '${hours} hours'
    ORDER BY timestamp ASC
  `,
    [pipelineId]
  )

  const latency = await query<MetricRow>(
    `
    SELECT value, timestamp
    FROM metrics
    WHERE pipeline_id = $1 AND metric_type = 'avg_latency'
    AND timestamp > NOW() - INTERVAL '${hours} hours'
    ORDER BY timestamp ASC
  `,
    [pipelineId]
  )

  const errorRate = await query<MetricRow>(
    `
    SELECT value, timestamp
    FROM metrics
    WHERE pipeline_id = $1 AND metric_type = 'error_rate'
    AND timestamp > NOW() - INTERVAL '${hours} hours'
    ORDER BY timestamp ASC
  `,
    [pipelineId]
  )

  const mapToMetricPoint = (row: MetricRow): MetricPoint => ({
    timestamp: row.timestamp,
    value: parseFloat(row.value),
  })

  return {
    documentsProcessed: docsProcessed.rows.map(mapToMetricPoint),
    avgLatency: latency.rows.map(mapToMetricPoint),
    errorRate: errorRate.rows.map(mapToMetricPoint),
  }
}

export async function recordMetric(
  pipelineId: string,
  metricType: string,
  value: number
): Promise<void> {
  await query(
    `INSERT INTO metrics (pipeline_id, metric_type, value) VALUES ($1, $2, $3)`,
    [pipelineId, metricType, value]
  )
}
