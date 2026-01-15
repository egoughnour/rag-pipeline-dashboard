import { config } from '../../config.js'
import type { EmbeddingProvider, EmbeddingModel } from './types.js'
import { OpenAIEmbeddingProvider } from './openai.provider.js'
import { VoyageEmbeddingProvider } from './voyage.provider.js'
import { MockEmbeddingProvider } from './mock.provider.js'

export type { EmbeddingProvider, EmbeddingModel }

let provider: EmbeddingProvider | null = null

/**
 * Get the configured embedding provider.
 * Lazy initialization to avoid errors during module load.
 */
export function getEmbeddingProvider(): EmbeddingProvider {
  if (!provider) {
    const providerType = config.embedding.provider

    switch (providerType) {
      case 'openai':
        provider = new OpenAIEmbeddingProvider()
        break
      case 'voyage':
        provider = new VoyageEmbeddingProvider()
        break
      case 'mock':
      default:
        provider = new MockEmbeddingProvider()
        break
    }

    console.log(`Initialized ${provider.name} embedding provider`)
  }

  return provider
}

/**
 * Reset the provider (useful for testing)
 */
export function resetEmbeddingProvider(): void {
  provider = null
}

/**
 * Get all available embedding models across all providers
 */
export function getAllAvailableModels(): Record<string, EmbeddingModel[]> {
  return {
    openai: new OpenAIEmbeddingProvider().getAvailableModels(),
    voyage: new VoyageEmbeddingProvider().getAvailableModels(),
    mock: new MockEmbeddingProvider().getAvailableModels(),
  }
}

// Re-export provider classes for direct instantiation if needed
export { OpenAIEmbeddingProvider, VoyageEmbeddingProvider, MockEmbeddingProvider }
