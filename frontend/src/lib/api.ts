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
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Dashboard
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const { data } = await api.get('/metrics')
  return data
}

export async function fetchRecentActivity(): Promise<Activity[]> {
  const { data } = await api.get('/activity')
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
  description?: string
  config: PipelineConfig
}): Promise<Pipeline> {
  const { data } = await api.post('/pipelines', pipeline)
  return data
}

export async function updatePipeline(
  id: string,
  pipeline: Partial<Pipeline>
): Promise<Pipeline> {
  const { data } = await api.put(`/pipelines/${id}`, pipeline)
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

export async function fetchPipelineMetrics(id: string): Promise<PipelineMetrics> {
  const { data } = await api.get(`/metrics/${id}`)
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
  formData.append('pipelineId', pipelineId)

  const { data } = await api.post('/documents', formData, {
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
export async function searchDocuments(query: string, options?: {
  pipelineId?: string
  limit?: number
}): Promise<SearchResult[]> {
  const { data } = await api.post('/search', {
    query,
    ...options,
  })
  return data.results
}
