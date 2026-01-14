import { query } from '../db/index.js'
import type { ActivityItem, DashboardStats } from '../types/index.js'

interface ActivityRow {
  id: string
  type: ActivityItem['type']
  message: string
  pipeline_id: string | null
  document_id: string | null
  timestamp: Date
}

interface StatsRow {
  total_pipelines: string
  active_pipelines: string
  total_documents: string
  total_chunks: string
  documents_processed_today: string
  avg_processing_time: string
}

function mapRowToActivity(row: ActivityRow): ActivityItem {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    pipelineId: row.pipeline_id ?? undefined,
    documentId: row.document_id ?? undefined,
    timestamp: row.timestamp,
  }
}

export async function getRecentActivity(limit: number = 20): Promise<ActivityItem[]> {
  const result = await query<ActivityRow>(
    `
    SELECT * FROM activities
    ORDER BY timestamp DESC
    LIMIT $1
  `,
    [limit]
  )

  return result.rows.map(mapRowToActivity)
}

export async function getActivityByPipeline(
  pipelineId: string,
  limit: number = 20
): Promise<ActivityItem[]> {
  const result = await query<ActivityRow>(
    `
    SELECT * FROM activities
    WHERE pipeline_id = $1
    ORDER BY timestamp DESC
    LIMIT $2
  `,
    [pipelineId, limit]
  )

  return result.rows.map(mapRowToActivity)
}

export async function createActivity(
  type: ActivityItem['type'],
  message: string,
  pipelineId?: string,
  documentId?: string
): Promise<ActivityItem> {
  const result = await query<ActivityRow>(
    `
    INSERT INTO activities (type, message, pipeline_id, document_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
    [type, message, pipelineId || null, documentId || null]
  )

  return mapRowToActivity(result.rows[0])
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const result = await query<StatsRow>(`
    SELECT
      (SELECT COUNT(*) FROM pipelines) as total_pipelines,
      (SELECT COUNT(*) FROM pipelines WHERE status = 'active') as active_pipelines,
      (SELECT COUNT(*) FROM documents) as total_documents,
      (SELECT COUNT(*) FROM chunks) as total_chunks,
      (SELECT COUNT(*) FROM documents WHERE processed_at > NOW() - INTERVAL '24 hours') as documents_processed_today,
      COALESCE(
        (SELECT AVG(value) FROM metrics WHERE metric_type = 'avg_latency' AND timestamp > NOW() - INTERVAL '24 hours'),
        0
      ) as avg_processing_time
  `)

  const row = result.rows[0]

  return {
    totalPipelines: parseInt(row.total_pipelines, 10),
    activePipelines: parseInt(row.active_pipelines, 10),
    totalDocuments: parseInt(row.total_documents, 10),
    totalChunks: parseInt(row.total_chunks, 10),
    documentsProcessedToday: parseInt(row.documents_processed_today, 10),
    avgProcessingTime: parseFloat(row.avg_processing_time),
  }
}
