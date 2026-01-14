import fs from 'fs/promises'
import path from 'path'

interface ChunkOptions {
  chunkSize: number
  chunkOverlap: number
}

interface Chunk {
  content: string
  metadata: {
    chunkIndex: number
    startChar: number
    endChar: number
  }
}

export async function chunkText(
  text: string,
  options: ChunkOptions
): Promise<Chunk[]> {
  const { chunkSize, chunkOverlap } = options
  const chunks: Chunk[] = []

  // Normalize whitespace
  const normalizedText = text.replace(/\s+/g, ' ').trim()

  if (normalizedText.length === 0) {
    return []
  }

  if (normalizedText.length <= chunkSize) {
    return [
      {
        content: normalizedText,
        metadata: {
          chunkIndex: 0,
          startChar: 0,
          endChar: normalizedText.length,
        },
      },
    ]
  }

  let startIndex = 0
  let chunkIndex = 0

  while (startIndex < normalizedText.length) {
    let endIndex = Math.min(startIndex + chunkSize, normalizedText.length)

    // Try to break at sentence boundaries
    if (endIndex < normalizedText.length) {
      const sentenceBreak = findSentenceBreak(
        normalizedText,
        startIndex + Math.floor(chunkSize * 0.8),
        endIndex
      )

      if (sentenceBreak > startIndex) {
        endIndex = sentenceBreak
      }
    }

    const content = normalizedText.slice(startIndex, endIndex).trim()

    if (content.length > 0) {
      chunks.push({
        content,
        metadata: {
          chunkIndex,
          startChar: startIndex,
          endChar: endIndex,
        },
      })

      chunkIndex++
    }

    // Move start position with overlap
    startIndex = endIndex - chunkOverlap

    // Ensure we make progress
    if (startIndex >= normalizedText.length - chunkOverlap) {
      break
    }
  }

  return chunks
}

function findSentenceBreak(text: string, minPos: number, maxPos: number): number {
  // Look for sentence-ending punctuation followed by space
  const sentenceEnders = ['. ', '! ', '? ', '.\n', '!\n', '?\n']

  let bestBreak = -1

  for (const ender of sentenceEnders) {
    let pos = text.lastIndexOf(ender, maxPos)
    while (pos > minPos) {
      if (pos > bestBreak) {
        bestBreak = pos + ender.length
      }
      pos = text.lastIndexOf(ender, pos - 1)
    }
  }

  return bestBreak
}

export async function extractTextFromFile(
  filePath: string,
  mimeType: string
): Promise<string> {
  const buffer = await fs.readFile(filePath)

  switch (mimeType) {
    case 'text/plain':
    case 'text/markdown':
    case 'text/csv':
      return buffer.toString('utf-8')

    case 'application/pdf':
      // Dynamic import for pdf-parse
      const pdfParse = (await import('pdf-parse')).default
      const pdfData = await pdfParse(buffer)
      return pdfData.text

    case 'application/json':
      const json = JSON.parse(buffer.toString('utf-8'))
      return JSON.stringify(json, null, 2)

    default:
      // Try to read as text for unknown types
      try {
        return buffer.toString('utf-8')
      } catch {
        throw new Error(`Unsupported file type: ${mimeType}`)
      }
  }
}

export function getSupportedMimeTypes(): string[] {
  return [
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/pdf',
    'application/json',
  ]
}

export function isSupportedMimeType(mimeType: string): boolean {
  return getSupportedMimeTypes().includes(mimeType)
}
