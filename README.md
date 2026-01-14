# RAG Pipeline Dashboard

A full-stack application for managing Retrieval-Augmented Generation (RAG) pipelines with real-time monitoring, document processing, and semantic search capabilities.

## Features

- **Pipeline Management**: Create, configure, and manage multiple RAG pipelines
- **Document Processing**: Upload and automatically chunk documents with configurable settings
- **Semantic Search**: Vector-based similarity search across indexed documents
- **Real-time Updates**: WebSocket-powered live updates for processing status
- **Metrics Dashboard**: Visualize pipeline performance and processing statistics
- **Activity Feed**: Track all pipeline and document events

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for development and builds
- TailwindCSS for styling
- React Query for server state management
- Recharts for data visualization
- Socket.io client for real-time updates

### Backend
- Node.js + Express + TypeScript
- PostgreSQL with pgvector extension
- Socket.io for WebSocket support
- OpenAI API for embeddings
- Zod for request validation

## Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- OpenAI API key

### Development Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Start PostgreSQL with pgvector**:
   ```bash
   docker compose up postgres -d
   ```

3. **Configure environment**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your OPENAI_API_KEY
   ```

4. **Run database migrations**:
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed  # Optional: add sample data
   ```

5. **Start development servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev

   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

6. **Open the dashboard**: http://localhost:5173

### Production Deployment

```bash
# Build and run with Docker Compose
OPENAI_API_KEY=your-key docker compose up -d
```

## API Endpoints

### Pipelines
- `GET /api/pipelines` - List all pipelines
- `POST /api/pipelines` - Create pipeline
- `GET /api/pipelines/:id` - Get pipeline details
- `PATCH /api/pipelines/:id` - Update pipeline
- `DELETE /api/pipelines/:id` - Delete pipeline
- `POST /api/pipelines/:id/start` - Start pipeline
- `POST /api/pipelines/:id/stop` - Stop pipeline
- `GET /api/pipelines/:id/metrics` - Get pipeline metrics

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents/:pipelineId/upload` - Upload document
- `DELETE /api/documents/:id` - Delete document

### Search
- `POST /api/search` - Semantic search

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/activity` - Recent activity feed

## Configuration

### Pipeline Config Options
| Option | Description | Default |
|--------|-------------|---------|
| `chunkSize` | Characters per chunk | 512 |
| `chunkOverlap` | Overlap between chunks | 50 |
| `embeddingModel` | OpenAI embedding model | text-embedding-3-small |
| `sourceType` | Document source (file/url/s3) | file |

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `OPENAI_API_KEY` | OpenAI API key for embeddings | Yes |
| `PORT` | Backend server port | No (3001) |
| `CORS_ORIGIN` | Allowed CORS origin | No (http://localhost:5173) |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│     Backend     │────▶│   PostgreSQL    │
│    (React)      │     │   (Express)     │     │   + pgvector    │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │    WebSocket          │    OpenAI API
        │◀─────────────────────▶│────────────────▶
```

## License

MIT
