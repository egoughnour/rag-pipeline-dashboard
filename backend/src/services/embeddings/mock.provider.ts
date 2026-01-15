import type { EmbeddingProvider, EmbeddingModel } from './types.js'

const MODELS: EmbeddingModel[] = [
  {
    id: 'mock-small',
    name: 'Mock Small',
    dimension: 384,
    description: 'Mock embedding for testing (384 dims)',
  },
  {
    id: 'mock-large',
    name: 'Mock Large',
    dimension: 1536,
    description: 'Mock embedding for testing (1536 dims)',
  },
]

/**
 * Mock Embedding Provider for testing and development
 *
 * Generates deterministic embeddings based on text content hash.
 * This allows for consistent test results without API calls.
 */
export class MockEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'mock'

  async embed(text: string, model: string = 'mock-large'): Promise<number[]> {
    const dimension = this.getDimension(model)
    return this.generateMockEmbedding(text, dimension)
  }

  async embedBatch(texts: string[], model: string = 'mock-large'): Promise<number[][]> {
    const dimension = this.getDimension(model)
    return texts.map((text) => this.generateMockEmbedding(text, dimension))
  }

  getDimension(model: string = 'mock-large'): number {
    const modelInfo = MODELS.find((m) => m.id === model)
    return modelInfo?.dimension ?? 1536
  }

  getAvailableModels(): EmbeddingModel[] {
    return MODELS
  }

  /**
   * Generate a deterministic mock embedding based on text content.
   * Uses a simple hash function to create reproducible vectors.
   */
  private generateMockEmbedding(text: string, dimension: number): number[] {
    const hash = this.simpleHash(text)
    const embedding: number[] = []

    // Use hash as seed for pseudo-random but deterministic values
    let seed = hash
    for (let i = 0; i < dimension; i++) {
      // Linear congruential generator for deterministic pseudo-random values
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      // Normalize to [-1, 1] range
      embedding.push((seed / 0x7fffffff) * 2 - 1)
    }

    // Normalize the vector to unit length
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map((val) => val / magnitude)
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}
