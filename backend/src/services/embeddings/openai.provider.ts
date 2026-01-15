import OpenAI from 'openai'
import type { EmbeddingProvider, EmbeddingModel } from './types.js'
import { config } from '../../config.js'

const MODELS: EmbeddingModel[] = [
  {
    id: 'text-embedding-3-small',
    name: 'Text Embedding 3 Small',
    dimension: 1536,
    description: 'Most cost-effective, good for most use cases',
  },
  {
    id: 'text-embedding-3-large',
    name: 'Text Embedding 3 Large',
    dimension: 3072,
    description: 'Highest quality, best for complex semantic tasks',
  },
  {
    id: 'text-embedding-ada-002',
    name: 'Text Embedding Ada 002',
    dimension: 1536,
    description: 'Legacy model, still widely used',
  },
]

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'openai'
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: config.embedding.openaiApiKey,
    })
  }

  async embed(text: string, model: string = 'text-embedding-3-small'): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model,
      input: text,
    })
    return response.data[0].embedding
  }

  async embedBatch(texts: string[], model: string = 'text-embedding-3-small'): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model,
      input: texts,
    })
    return response.data.map((d) => d.embedding)
  }

  getDimension(model: string = 'text-embedding-3-small'): number {
    const modelInfo = MODELS.find((m) => m.id === model)
    return modelInfo?.dimension ?? 1536
  }

  getAvailableModels(): EmbeddingModel[] {
    return MODELS
  }
}
