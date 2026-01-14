import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  getSocket,
  PipelineStatusEvent,
  DocumentProgressEvent,
  MetricsUpdateEvent,
} from '@/lib/socket'

export function useWebSocket() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = getSocket()

    const handlePipelineStatus = (event: PipelineStatusEvent) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
      queryClient.invalidateQueries({
        queryKey: ['pipeline', event.pipelineId],
      })
    }

    const handleDocumentProgress = (event: DocumentProgressEvent) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({
        queryKey: ['documents', event.pipelineId],
      })
      queryClient.invalidateQueries({
        queryKey: ['document', event.documentId],
      })
    }

    const handleMetricsUpdate = (event: MetricsUpdateEvent) => {
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
      queryClient.invalidateQueries({
        queryKey: ['pipeline-metrics', event.pipelineId],
      })
    }

    socket.on('pipeline:status', handlePipelineStatus)
    socket.on('document:progress', handleDocumentProgress)
    socket.on('metrics:update', handleMetricsUpdate)

    return () => {
      socket.off('pipeline:status', handlePipelineStatus)
      socket.off('document:progress', handleDocumentProgress)
      socket.off('metrics:update', handleMetricsUpdate)
    }
  }, [queryClient])

  const subscribeToPipeline = useCallback((pipelineId: string) => {
    const socket = getSocket()
    socket.emit('subscribe:pipeline', pipelineId)

    return () => {
      socket.emit('unsubscribe:pipeline', pipelineId)
    }
  }, [])

  return { subscribeToPipeline }
}
