import { useState } from 'react'
import { Search as SearchIcon, FileText, Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { searchDocuments } from '@/lib/api'
import { usePipelines } from '@/hooks/usePipelines'
import type { SearchResult } from '@/types'

export default function Search() {
  const [query, setQuery] = useState('')
  const [selectedPipeline, setSelectedPipeline] = useState<string>('')
  const [results, setResults] = useState<SearchResult[]>([])

  const { data: pipelines = [] } = usePipelines()

  const searchMutation = useMutation({
    mutationFn: () =>
      searchDocuments(query, {
        pipelineId: selectedPipeline || undefined,
        limit: 20,
      }),
    onSuccess: (data) => {
      setResults(data)
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      searchMutation.mutate()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Semantic Search</h1>
        <p className="text-gray-500 mt-1">
          Search across your indexed documents using natural language
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedPipeline}
            onChange={(e) => setSelectedPipeline(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Pipelines</option>
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!query.trim() || searchMutation.isPending}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {searchMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <SearchIcon className="h-5 w-5" />
            )}
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Found {results.length} results
          </p>
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {result.documentName}
                    </span>
                  </div>
                  <span className="text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                    {(result.score * 100).toFixed(1)}% match
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{result.content}</p>
                {result.metadata && Object.keys(result.metadata).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      {JSON.stringify(result.metadata)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {searchMutation.isSuccess && results.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No results found for "{query}"</p>
          <p className="text-sm text-gray-400 mt-1">
            Try adjusting your search query or selecting a different pipeline
          </p>
        </div>
      )}

      {!searchMutation.isSuccess && results.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Enter a query to search your documents</p>
          <p className="text-sm text-gray-400 mt-1">
            Use natural language to find relevant content
          </p>
        </div>
      )}
    </div>
  )
}
