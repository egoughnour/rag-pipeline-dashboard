import axios from 'axios'
import type {
  Pipeline,
  PipelineConfig,
  Document,
  Chunk,
  SearchResult,
  DashboardMetrics,
  Activity,
  PipelineMetrics,
} from '@/types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Dashboard
export async function fetchDashboardStats(): Promise<DashboardMetrics> {
  const { data } = await api.get('/dashboard/stats')
  return data
}

export async function fetchRecentActivity(limit = 20): Promise<Activity[]> {
  const { data } = await api.get('/dashboard/activity', { params: { limit } })
  return data
}

// Pipelines
export async function fetchPipelines(): Promise<Pipeline[]> {
  const { data } = await api.get('/pipelines')
  return data
}

export async function fetchPipeline(id: string): Promise<Pipeline> {
  const { data } = await api.get(`/pipelines/${id}`)
  return data
}

export async function createPipeline(pipeline: {
  name: string
  description?: string | null
  config: PipelineConfig
}): Promise<Pipeline> {
  const { data } = await api.post('/pipelines', pipeline)
  return data
}

export async function updatePipeline(
  id: string,
  pipeline: Partial<Pipeline>
): Promise<Pipeline> {
  const { data } = await api.patch(`/pipelines/${id}`, pipeline)
  return data
}

export async function deletePipeline(id: string): Promise<void> {
  await api.delete(`/pipelines/${id}`)
}

export async function startPipeline(id: string): Promise<Pipeline> {
  const { data } = await api.post(`/pipelines/${id}/start`)
  return data
}

export async function stopPipeline(id: string): Promise<Pipeline> {
  const { data } = await api.post(`/pipelines/${id}/stop`)
  return data
}

export async function fetchPipelineMetrics(id: string, hours = 24): Promise<PipelineMetrics> {
  const { data } = await api.get(`/pipelines/${id}/metrics`, { params: { hours } })
  return data
}

// Documents
export async function fetchDocuments(pipelineId?: string): Promise<Document[]> {
  const params = pipelineId ? { pipelineId } : {}
  const { data } = await api.get('/documents', { params })
  return data
}

export async function fetchDocument(id: string): Promise<Document> {
  const { data } = await api.get(`/documents/${id}`)
  return data
}

export async function uploadDocument(
  pipelineId: string,
  file: File
): Promise<Document> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post(`/documents/${pipelineId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`)
}

export async function fetchDocumentChunks(documentId: string): Promise<Chunk[]> {
  const { data } = await api.get(`/documents/${documentId}/chunks`)
  return data
}

// Search
export async function searchDocuments(
  query: string,
  options?: {
    pipelineId?: string
    limit?: number
  }
): Promise<SearchResult[]> {
  const { data } = await api.post('/search', {
    query,
    ...options,
  })
  return data
}
