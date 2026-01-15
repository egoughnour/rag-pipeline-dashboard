import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { config } from '../config.js'

export interface ApiError extends Error {
  statusCode?: number
  details?: unknown
}

export function errorHandler(
  err: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('Error:', err)
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    })
    return
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    res.status(400).json({
      error: 'File upload error',
      message: err.message,
    })
    return
  }

  // Handle known API errors
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  res.status(statusCode).json({
    error: message,
    ...(config.nodeEnv === 'development' && err.details ? { details: err.details } : {}),
  })
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  })
}

export function createApiError(message: string, statusCode: number = 500): ApiError {
  const error = new Error(message) as ApiError
  error.statusCode = statusCode
  return error
}
