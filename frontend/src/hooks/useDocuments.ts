import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchDocuments,
  fetchDocument,
  uploadDocument,
  deleteDocument,
  fetchDocumentChunks,
} from '@/lib/api'

export function useDocuments(pipelineId?: string) {
  return useQuery({
    queryKey: ['documents', pipelineId],
    queryFn: () => fetchDocuments(pipelineId),
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => fetchDocument(id),
    enabled: !!id,
  })
}

export function useDocumentChunks(documentId: string) {
  return useQuery({
    queryKey: ['document-chunks', documentId],
    queryFn: () => fetchDocumentChunks(documentId),
    enabled: !!documentId,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ pipelineId, file }: { pipelineId: string; file: File }) =>
      uploadDocument(pipelineId, file),
    onSuccess: (_, { pipelineId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['documents', pipelineId] })
      queryClient.invalidateQueries({ queryKey: ['pipeline', pipelineId] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}
