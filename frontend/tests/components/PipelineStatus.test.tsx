import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import PipelineStatus from '../../src/components/Dashboard/PipelineStatus'
import type { Pipeline } from '../../src/types'

const mockPipelines: Pipeline[] = [
  {
    id: '1',
    name: 'Active Pipeline',
    description: 'Test description',
    status: 'active',
    config: {
      chunkSize: 512,
      chunkOverlap: 50,
      embeddingModel: 'text-embedding-3-small',
      sourceType: 'file',
    },
    documentCount: 10,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Paused Pipeline',
    description: null,
    status: 'paused',
    config: {
      chunkSize: 1024,
      chunkOverlap: 100,
      embeddingModel: 'text-embedding-3-large',
      sourceType: 's3',
    },
    documentCount: 5,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
]

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('PipelineStatus', () => {
  it('should render all pipelines', () => {
    renderWithRouter(<PipelineStatus pipelines={mockPipelines} />)

    expect(screen.getByText('Active Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Paused Pipeline')).toBeInTheDocument()
  })

  it('should display correct status badges', () => {
    renderWithRouter(<PipelineStatus pipelines={mockPipelines} />)

    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('paused')).toBeInTheDocument()
  })

  it('should show document counts', () => {
    renderWithRouter(<PipelineStatus pipelines={mockPipelines} />)

    expect(screen.getByText('10 documents')).toBeInTheDocument()
    expect(screen.getByText('5 documents')).toBeInTheDocument()
  })

  it('should show empty state when no pipelines', () => {
    renderWithRouter(<PipelineStatus pipelines={[]} />)

    expect(screen.getByText('No pipelines created yet')).toBeInTheDocument()
  })
})
