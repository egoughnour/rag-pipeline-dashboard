import { query } from '../db/index.js'
import type { Document } from '../types/index.js'

interface DocumentRow {
  id: string
  pipeline_id: string
  name: string
  mime_type: string
  size: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  chunk_count: string | null
  error_message: string | null
  uploaded_at: Date
  processed_at: Date | null
}

function mapRowToDocument(row: DocumentRow): Document {
  return {
    id: row.id,
    pipelineId: row.pipeline_id,
    name: row.name,
    mimeType: row.mime_type,
    size: parseInt(row.size, 10),
    status: row.status,
    chunkCount: row.chunk_count ? parseInt(row.chunk_count, 10) : undefined,
    errorMessage: row.error_message ?? undefined,
    uploadedAt: row.uploaded_at,
    processedAt: row.processed_at ?? undefined,
  }
}

export async function getDocumentsByPipeline(pipelineId: string): Promise<Document[]> {
  const result = await query<DocumentRow>(
    `
    SELECT * FROM documents
    WHERE pipeline_id = $1
    ORDER BY uploaded_at DESC
  `,
    [pipelineId]
  )

  return result.rows.map(mapRowToDocument)
}

export async function getAllDocuments(): Promise<Document[]> {
  const result = await query<DocumentRow>(`
    SELECT * FROM documents
    ORDER BY uploaded_at DESC
  `)

  return result.rows.map(mapRowToDocument)
}

export async function getDocumentById(id: string): Promise<Document | null> {
  const result = await query<DocumentRow>('SELECT * FROM documents WHERE id = $1', [id])

  if (result.rows.length === 0) {
    return null
  }

  return mapRowToDocument(result.rows[0])
}

export async function createDocument(
  pipelineId: string,
  name: string,
  mimeType: string,
  size: number
): Promise<Document> {
  const result = await query<DocumentRow>(
    `
    INSERT INTO documents (pipeline_id, name, mime_type, size, status)
    VALUES ($1, $2, $3, $4, 'pending')
    RETURNING *
  `,
    [pipelineId, name, mimeType, size]
  )

  // Log activity
  await query(
    `INSERT INTO activities (type, message, pipeline_id, document_id)
     VALUES ('document_uploaded', $1, $2, $3)`,
    [`Document "${name}" uploaded`, pipelineId, result.rows[0].id]
  )

  return mapRowToDocument(result.rows[0])
}

export async function updateDocumentStatus(
  id: string,
  status: Document['status'],
  chunkCount?: number,
  errorMessage?: string
): Promise<Document | null> {
  const updates: string[] = ['status = $2']
  const values: unknown[] = [id, status]
  let paramIndex = 3

  if (chunkCount !== undefined) {
    updates.push(`chunk_count = $${paramIndex++}`)
    values.push(chunkCount)
  }

  if (errorMessage !== undefined) {
    updates.push(`error_message = $${paramIndex++}`)
    values.push(errorMessage)
  }

  if (status === 'completed' || status === 'failed') {
    updates.push(`processed_at = NOW()`)
  }

  const result = await query<DocumentRow>(
    `
    UPDATE documents
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING *
  `,
    values
  )

  if (result.rows.length === 0) {
    return null
  }

  const doc = mapRowToDocument(result.rows[0])

  // Log activity
  if (status === 'completed') {
    await query(
      `INSERT INTO activities (type, message, pipeline_id, document_id)
       VALUES ('document_processed', $1, $2, $3)`,
      [`Document "${doc.name}" processed (${chunkCount} chunks)`, doc.pipelineId, id]
    )
  } else if (status === 'failed') {
    await query(
      `INSERT INTO activities (type, message, pipeline_id, document_id)
       VALUES ('error', $1, $2, $3)`,
      [`Failed to process "${doc.name}": ${errorMessage}`, doc.pipelineId, id]
    )
  }

  return doc
}

export async function deleteDocument(id: string): Promise<boolean> {
  const result = await query('DELETE FROM documents WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}

export async function getPendingDocuments(): Promise<Document[]> {
  const result = await query<DocumentRow>(`
    SELECT d.* FROM documents d
    JOIN pipelines p ON p.id = d.pipeline_id
    WHERE d.status = 'pending' AND p.status = 'active'
    ORDER BY d.uploaded_at ASC
    LIMIT 10
  `)

  return result.rows.map(mapRowToDocument)
}
