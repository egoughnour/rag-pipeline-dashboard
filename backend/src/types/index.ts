export interface Pipeline {
  id: string
  name: string
  description: string | null
  status: 'active' | 'paused' | 'error'
  config: PipelineConfig
  documentCount?: number
  createdAt: Date
  updatedAt: Date
}

export interface PipelineConfig {
  chunkSize: number
  chunkOverlap: number
  embeddingModel: string
  sourceType: 'file' | 'url' | 's3'
  s3Bucket?: string
  s3Prefix?: string
}

export interface Document {
  id: string
  pipelineId: string
  name: string
  mimeType: string
  size: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  chunkCount?: number
  errorMessage?: string
  uploadedAt: Date
  processedAt?: Date
}

export interface Chunk {
  id: string
  documentId: string
  pipelineId: string
  content: string
  embedding: number[]
  metadata: Record<string, unknown>
  chunkIndex: number
  createdAt: Date
}

export interface SearchResult {
  id: string
  documentId: string
  documentName: string
  content: string
  score: number
  metadata: Record<string, unknown>
}

export interface MetricPoint {
  timestamp: Date
  value: number
}

export interface PipelineMetrics {
  documentsProcessed: MetricPoint[]
  avgLatency: MetricPoint[]
  errorRate: MetricPoint[]
}

export interface ActivityItem {
  id: string
  type: 'document_uploaded' | 'document_processed' | 'pipeline_started' | 'pipeline_stopped' | 'error'
  message: string
  pipelineId?: string
  documentId?: string
  timestamp: Date
}

export interface DashboardStats {
  totalPipelines: number
  activePipelines: number
  totalDocuments: number
  totalChunks: number
  documentsProcessedToday: number
  avgProcessingTime: number
}

// API Request/Response types
export interface CreatePipelineRequest {
  name: string
  description?: string | null
  config: PipelineConfig
}

export interface UpdatePipelineRequest {
  name?: string
  description?: string | null
  config?: Partial<PipelineConfig>
}

export interface SearchRequest {
  query: string
  pipelineId?: string
  limit?: number
}
