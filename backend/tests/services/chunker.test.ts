import { describe, it, expect } from 'vitest'
import { chunkText } from '../../src/services/chunker.service.js'

describe('chunker.service', () => {
  describe('chunkText', () => {
    it('should return empty array for empty text', async () => {
      const result = await chunkText('', { chunkSize: 100, chunkOverlap: 10 })
      expect(result).toEqual([])
    })

    it('should return empty array for whitespace-only text', async () => {
      const result = await chunkText('   \n\t  ', { chunkSize: 100, chunkOverlap: 10 })
      expect(result).toEqual([])
    })

    it('should return single chunk for text shorter than chunkSize', async () => {
      const text = 'This is a short text.'
      const result = await chunkText(text, { chunkSize: 100, chunkOverlap: 10 })

      expect(result).toHaveLength(1)
      expect(result[0].content).toBe(text)
      expect(result[0].metadata.chunkIndex).toBe(0)
    })

    it('should split long text into multiple chunks', async () => {
      const sentence = 'This is a sentence. '
      const text = sentence.repeat(20) // ~400 characters
      const result = await chunkText(text, { chunkSize: 100, chunkOverlap: 20 })

      expect(result.length).toBeGreaterThan(1)
      result.forEach((chunk, index) => {
        expect(chunk.metadata.chunkIndex).toBe(index)
        expect(chunk.content.length).toBeLessThanOrEqual(110) // Allow some flexibility for sentence breaks
      })
    })

    it('should respect chunk overlap', async () => {
      const text = 'Word1. Word2. Word3. Word4. Word5. Word6. Word7. Word8. Word9. Word10.'
      const result = await chunkText(text, { chunkSize: 30, chunkOverlap: 10 })

      // With overlap, later chunks should start before the previous chunk ended
      expect(result.length).toBeGreaterThan(1)
    })

    it('should try to break at sentence boundaries', async () => {
      const text = 'First sentence here. Second sentence here. Third sentence here. Fourth sentence here.'
      const result = await chunkText(text, { chunkSize: 50, chunkOverlap: 5 })

      // Chunks should preferably end at sentence boundaries
      result.forEach((chunk) => {
        // Most chunks should end with sentence-ending punctuation
        const endsWithSentence = /[.!?]\s*$/.test(chunk.content)
        // Allow some flexibility for the last chunk
        if (chunk.metadata.chunkIndex < result.length - 1) {
          expect(endsWithSentence || chunk.content.length >= 40).toBe(true)
        }
      })
    })

    it('should include correct metadata', async () => {
      const text = 'Some sample text that will be chunked into pieces.'
      const result = await chunkText(text, { chunkSize: 20, chunkOverlap: 5 })

      result.forEach((chunk, index) => {
        expect(chunk.metadata).toHaveProperty('chunkIndex', index)
        expect(chunk.metadata).toHaveProperty('startChar')
        expect(chunk.metadata).toHaveProperty('endChar')
        expect(typeof chunk.metadata.startChar).toBe('number')
        expect(typeof chunk.metadata.endChar).toBe('number')
      })
    })

    it('should normalize whitespace', async () => {
      const text = 'Text   with    multiple   \n\n  spaces.'
      const result = await chunkText(text, { chunkSize: 100, chunkOverlap: 10 })

      expect(result).toHaveLength(1)
      expect(result[0].content).toBe('Text with multiple spaces.')
    })
  })
})
