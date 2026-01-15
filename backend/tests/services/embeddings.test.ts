import { describe, it, expect, beforeEach } from 'vitest'
import { MockEmbeddingProvider } from '../../src/services/embeddings/mock.provider.js'

describe('MockEmbeddingProvider', () => {
  let provider: MockEmbeddingProvider

  beforeEach(() => {
    provider = new MockEmbeddingProvider()
  })

  describe('embed', () => {
    it('should return embedding of correct dimension', async () => {
      const embedding = await provider.embed('test text')
      expect(embedding).toHaveLength(1536) // default mock-large dimension
    })

    it('should return embedding with specified dimension', async () => {
      const embedding = await provider.embed('test text', 'mock-small')
      expect(embedding).toHaveLength(384)
    })

    it('should return normalized vectors (unit length)', async () => {
      const embedding = await provider.embed('test text')
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
      expect(magnitude).toBeCloseTo(1.0, 5)
    })

    it('should return deterministic embeddings for same text', async () => {
      const embedding1 = await provider.embed('test text')
      const embedding2 = await provider.embed('test text')
      expect(embedding1).toEqual(embedding2)
    })

    it('should return different embeddings for different text', async () => {
      const embedding1 = await provider.embed('text one')
      const embedding2 = await provider.embed('text two')
      expect(embedding1).not.toEqual(embedding2)
    })
  })

  describe('embedBatch', () => {
    it('should return embeddings for all texts', async () => {
      const texts = ['text one', 'text two', 'text three']
      const embeddings = await provider.embedBatch(texts)

      expect(embeddings).toHaveLength(3)
      embeddings.forEach((emb) => {
        expect(emb).toHaveLength(1536)
      })
    })

    it('should return same results as individual embeds', async () => {
      const texts = ['text one', 'text two']
      const batchEmbeddings = await provider.embedBatch(texts)

      const individualEmbeddings = await Promise.all(texts.map((t) => provider.embed(t)))

      expect(batchEmbeddings).toEqual(individualEmbeddings)
    })
  })

  describe('getDimension', () => {
    it('should return correct dimension for mock-small', () => {
      expect(provider.getDimension('mock-small')).toBe(384)
    })

    it('should return correct dimension for mock-large', () => {
      expect(provider.getDimension('mock-large')).toBe(1536)
    })

    it('should return default dimension for unknown model', () => {
      expect(provider.getDimension('unknown')).toBe(1536)
    })
  })

  describe('getAvailableModels', () => {
    it('should return list of available models', () => {
      const models = provider.getAvailableModels()
      expect(models).toHaveLength(2)
      expect(models.map((m) => m.id)).toContain('mock-small')
      expect(models.map((m) => m.id)).toContain('mock-large')
    })
  })

  describe('provider metadata', () => {
    it('should have correct name', () => {
      expect(provider.name).toBe('mock')
    })
  })
})
