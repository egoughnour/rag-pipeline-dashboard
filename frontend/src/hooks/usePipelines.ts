import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchPipelines,
  fetchPipeline,
  createPipeline,
  updatePipeline,
  deletePipeline,
  startPipeline,
  stopPipeline,
  fetchPipelineMetrics,
} from '@/lib/api'
import type { Pipeline, PipelineConfig } from '@/types'

export function usePipelines() {
  return useQuery({
    queryKey: ['pipelines'],
    queryFn: fetchPipelines,
  })
}

export function usePipeline(id: string) {
  return useQuery({
    queryKey: ['pipeline', id],
    queryFn: () => fetchPipeline(id),
    enabled: !!id,
  })
}

export function usePipelineMetrics(id: string) {
  return useQuery({
    queryKey: ['pipeline-metrics', id],
    queryFn: () => fetchPipelineMetrics(id),
    enabled: !!id,
    refetchInterval: 30000, // Refresh every 30 seconds
  })
}

export function useCreatePipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (pipeline: {
      name: string
      description?: string
      config: PipelineConfig
    }) => createPipeline(pipeline),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

export function useUpdatePipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pipeline> }) =>
      updatePipeline(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline', id] })
    },
  })
}

export function useDeletePipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePipeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
    },
  })
}

export function useStartPipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: startPipeline,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline', id] })
    },
  })
}

export function useStopPipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: stopPipeline,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['pipelines'] })
      queryClient.invalidateQueries({ queryKey: ['pipeline', id] })
    },
  })
}
