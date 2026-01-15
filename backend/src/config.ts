import dotenv from 'dotenv'

dotenv.config()

export type EmbeddingProvider = 'openai' | 'voyage' | 'mock'

function getEmbeddingProvider(): EmbeddingProvider {
  const provider = process.env.EMBEDDING_PROVIDER?.toLowerCase()

  if (provider === 'voyage') return 'voyage'
  if (provider === 'mock') return 'mock'

  // Auto-detect based on available API keys
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.VOYAGE_API_KEY || process.env.ANTHROPIC_API_KEY) return 'voyage'

  return 'mock' // Fallback for testing
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rag_pipeline',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Embedding configuration
  embedding: {
    provider: getEmbeddingProvider(),
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    voyageApiKey: process.env.VOYAGE_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  },

  // AWS (optional, for S3 source type)
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  },
}

// Validate required config
export function validateConfig() {
  const required = ['DATABASE_URL']
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.warn(`Warning: Missing environment variables: ${missing.join(', ')}`)
  }

  // Check embedding provider configuration
  const { provider } = config.embedding
  if (provider === 'openai' && !config.embedding.openaiApiKey) {
    console.warn('Warning: OPENAI_API_KEY not set but OpenAI provider selected.')
  }
  if (provider === 'voyage' && !config.embedding.voyageApiKey && !config.embedding.anthropicApiKey) {
    console.warn('Warning: Neither VOYAGE_API_KEY nor ANTHROPIC_API_KEY set but Voyage provider selected.')
  }
  if (provider === 'mock') {
    console.warn('Warning: Using mock embedding provider. Set OPENAI_API_KEY or VOYAGE_API_KEY for real embeddings.')
  }

  console.log(`Embedding provider: ${provider}`)
}
