export interface EmbeddingProvider {
  /**
   * Generate embeddings for a single text input
   */
  embed(text: string, model?: string): Promise<number[]>

  /**
   * Generate embeddings for multiple texts (batch)
   */
  embedBatch(texts: string[], model?: string): Promise<number[][]>

  /**
   * Get the dimension of embeddings for a given model
   */
  getDimension(model?: string): number

  /**
   * Get available models for this provider
   */
  getAvailableModels(): EmbeddingModel[]

  /**
   * Provider name
   */
  readonly name: string
}

export interface EmbeddingModel {
  id: string
  name: string
  dimension: number
  description?: string
}

export interface EmbeddingConfig {
  provider: 'openai' | 'voyage' | 'mock'
  model?: string
}
