import type { EmbeddingProvider, EmbeddingModel } from './types.js'
import { config } from '../../config.js'

const MODELS: EmbeddingModel[] = [
  {
    id: 'voyage-3',
    name: 'Voyage 3',
    dimension: 1024,
    description: 'Latest general-purpose embedding model',
  },
  {
    id: 'voyage-3-lite',
    name: 'Voyage 3 Lite',
    dimension: 512,
    description: 'Lightweight, cost-effective option',
  },
  {
    id: 'voyage-code-3',
    name: 'Voyage Code 3',
    dimension: 1024,
    description: 'Optimized for code and technical content',
  },
  {
    id: 'voyage-finance-2',
    name: 'Voyage Finance 2',
    dimension: 1024,
    description: 'Specialized for financial documents',
  },
  {
    id: 'voyage-law-2',
    name: 'Voyage Law 2',
    dimension: 1024,
    description: 'Specialized for legal documents',
  },
]

/**
 * Voyage AI Embedding Provider
 *
 * Voyage AI is Anthropic's recommended embedding partner and can be used
 * with either a Voyage API key or an Anthropic API key (via the partnership).
 *
 * This provides a great option for users who already have Claude/Anthropic
 * API access and want high-quality embeddings without a separate OpenAI account.
 */
export class VoyageEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'voyage'
  private apiKey: string
  private baseUrl = 'https://api.voyageai.com/v1'

  constructor() {
    // Prefer dedicated Voyage key, fall back to Anthropic key
    this.apiKey = config.embedding.voyageApiKey || config.embedding.anthropicApiKey

    if (!this.apiKey) {
      throw new Error('No API key available for Voyage AI. Set VOYAGE_API_KEY or ANTHROPIC_API_KEY.')
    }
  }

  async embed(text: string, model: string = 'voyage-3'): Promise<number[]> {
    const embeddings = await this.embedBatch([text], model)
    return embeddings[0]
  }

  async embedBatch(texts: string[], model: string = 'voyage-3'): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: texts,
        input_type: 'document', // or 'query' for search queries
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Voyage API error: ${response.status} - ${error}`)
    }

    const data = (await response.json()) as {
      data: Array<{ embedding: number[] }>
    }

    return data.data.map((d) => d.embedding)
  }

  getDimension(model: string = 'voyage-3'): number {
    const modelInfo = MODELS.find((m) => m.id === model)
    return modelInfo?.dimension ?? 1024
  }

  getAvailableModels(): EmbeddingModel[] {
    return MODELS
  }
}
