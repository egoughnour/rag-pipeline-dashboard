-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'paused' CHECK (status IN ('active', 'paused', 'error')),
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    chunk_count INTEGER,
    error_message TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Chunks table with vector embedding
CREATE TABLE IF NOT EXISTS chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI text-embedding-3-small dimension
    metadata JSONB DEFAULT '{}',
    chunk_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table for feed
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics table for time-series data
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id UUID REFERENCES pipelines(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    value NUMERIC NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_documents_pipeline_id ON documents(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_pipeline_id ON chunks(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_pipeline_timestamp ON metrics(pipeline_id, timestamp DESC);

-- Note: IVFFlat index requires data to be created effectively.
-- For production, run this after inserting initial data:
-- CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks
-- USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
--
-- For now, use HNSW which doesn't require pre-existing data:
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON chunks
USING hnsw (embedding vector_cosine_ops);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for pipelines updated_at
DROP TRIGGER IF EXISTS update_pipelines_updated_at ON pipelines;
CREATE TRIGGER update_pipelines_updated_at
    BEFORE UPDATE ON pipelines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
