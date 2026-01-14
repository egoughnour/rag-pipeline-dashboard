import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import * as documentService from '../services/document.service.js'
import * as pipelineService from '../services/pipeline.service.js'
import * as chunkerService from '../services/chunker.service.js'
import * as embeddingService from '../services/embedding.service.js'
import { getSocketIO } from '../socket.js'

const router = Router()

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads')

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(uploadDir, { recursive: true })
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    if (chunkerService.isSupportedMimeType(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`))
    }
  },
})

// GET /api/documents - List all documents
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pipelineId = req.query.pipelineId as string | undefined

    const documents = pipelineId
      ? await documentService.getDocumentsByPipeline(pipelineId)
      : await documentService.getAllDocuments()

    res.json(documents)
  })
)

// GET /api/documents/:id - Get single document
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const document = await documentService.getDocumentById(req.params.id)

    if (!document) {
      res.status(404).json({ error: 'Document not found' })
      return
    }

    res.json(document)
  })
)

// POST /api/documents/:pipelineId/upload - Upload document
router.post(
  '/:pipelineId/upload',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const { pipelineId } = req.params
    const file = req.file

    if (!file) {
      res.status(400).json({ error: 'No file provided' })
      return
    }

    // Verify pipeline exists
    const pipeline = await pipelineService.getPipelineById(pipelineId)
    if (!pipeline) {
      await fs.unlink(file.path)
      res.status(404).json({ error: 'Pipeline not found' })
      return
    }

    // Create document record
    const document = await documentService.createDocument(
      pipelineId,
      file.originalname,
      file.mimetype,
      file.size
    )

    // Emit WebSocket event
    const io = getSocketIO()
    io.to(`pipeline:${pipelineId}`).emit('document:created', document)

    // Process document asynchronously if pipeline is active
    if (pipeline.status === 'active') {
      processDocument(document.id, pipelineId, file.path, pipeline.config).catch(
        console.error
      )
    }

    res.status(201).json(document)
  })
)

// DELETE /api/documents/:id - Delete document
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const document = await documentService.getDocumentById(req.params.id)

    if (!document) {
      res.status(404).json({ error: 'Document not found' })
      return
    }

    // Delete chunks first
    await embeddingService.deleteChunksByDocument(req.params.id)

    // Delete document
    await documentService.deleteDocument(req.params.id)

    // Emit WebSocket event
    const io = getSocketIO()
    io.to(`pipeline:${document.pipelineId}`).emit('document:deleted', { id: req.params.id })

    res.status(204).send()
  })
)

// Background document processing
async function processDocument(
  documentId: string,
  pipelineId: string,
  filePath: string,
  config: { chunkSize: number; chunkOverlap: number; embeddingModel: string }
): Promise<void> {
  const io = getSocketIO()

  try {
    // Update status to processing
    await documentService.updateDocumentStatus(documentId, 'processing')
    io.to(`pipeline:${pipelineId}`).emit('document:processing', { id: documentId })

    // Get document for mime type
    const document = await documentService.getDocumentById(documentId)
    if (!document) {
      throw new Error('Document not found')
    }

    // Extract text from file
    const text = await chunkerService.extractTextFromFile(filePath, document.mimeType)

    // Chunk the text
    const chunks = await chunkerService.chunkText(text, {
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap,
    })

    // Create embeddings and store chunks
    const chunkCount = await embeddingService.createChunks(
      documentId,
      pipelineId,
      chunks.map((c) => ({
        content: c.content,
        metadata: { ...c.metadata, documentName: document.name },
      })),
      config.embeddingModel
    )

    // Update status to completed
    const updatedDoc = await documentService.updateDocumentStatus(
      documentId,
      'completed',
      chunkCount
    )

    io.to(`pipeline:${pipelineId}`).emit('document:completed', updatedDoc)

    // Clean up uploaded file
    await fs.unlink(filePath)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    const updatedDoc = await documentService.updateDocumentStatus(
      documentId,
      'failed',
      undefined,
      errorMessage
    )

    io.to(`pipeline:${pipelineId}`).emit('document:failed', updatedDoc)

    console.error(`Error processing document ${documentId}:`, error)

    // Clean up uploaded file
    try {
      await fs.unlink(filePath)
    } catch {
      // Ignore cleanup errors
    }
  }
}

export default router
