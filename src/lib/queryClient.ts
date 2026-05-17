/**
 * Query Client — Ada2AI
 * TanStack React Query configuration.
 * Central cache for all server state.
 */
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { captureError } from './monitoring'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data stays fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Cache kept for 10 minutes after component unmounts
      gcTime: 1000 * 60 * 10,
      // 2 retries on failure (with exponential backoff)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      // Don't refetch just because user switched tabs
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      captureError(error as Error, {
        queryKey: JSON.stringify(query.queryKey),
      })
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      captureError(error as Error, { source: 'mutation' })
    },
  }),
})
