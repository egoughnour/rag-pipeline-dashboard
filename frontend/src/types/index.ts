export interface Pipeline {
  id: string
  name: string
  description: string | null
  status: 'active' | 'paused' | 'error'
  config: PipelineConfig
  createdAt: string
  updatedAt: string
  documentCount?: number
  lastProcessedAt?: string
}

export interface PipelineConfig {
  chunkSize: number
  chunkOverlap: number
  embeddingModel: string
  sourceType: 'file' | 'url' | 'database'
}

export interface Document {
  id: string
  pipelineId: string
  filename: string
  contentType: string | null
  status: 'pending' | 'processing' | 'indexed' | 'error'
  metadata: Record<string, unknown> | null
  createdAt: string
  processedAt: string | null
  chunkCount?: number
}

export interface Chunk {
  id: string
  documentId: string
  content: string
  chunkIndex: number
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface SearchResult {
  id: string
  content: string
  score: number
  documentId: string
  documentName: string
  metadata: Record<string, unknown> | null
}

export interface DashboardMetrics {
  totalPipelines: number
  activePipelines: number
  totalDocuments: number
  documentsProcessed: number
  documentsProcessing: number
  documentsPending: number
  documentsError: number
  avgProcessingTime: number
  totalChunks: number
}

export interface Activity {
  id: string
  type: 'pipeline_created' | 'pipeline_started' | 'pipeline_stopped' | 'document_uploaded' | 'document_processed' | 'search_query'
  message: string
  timestamp: string
  pipelineId?: string
  documentId?: string
}

export interface MetricPoint {
  timestamp: string
  value: number
}

export interface PipelineMetrics {
  documentsProcessed: MetricPoint[]
  avgLatency: MetricPoint[]
  errorRate: MetricPoint[]
}
