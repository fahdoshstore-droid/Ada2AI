/** Saved formations for the signed-in coach: list + create/update/delete. */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listFormations, createFormation, updateFormation, deleteFormation,
  type FormationInput, type SavedFormation,
} from '../services/formations'
import { trackEvent } from '../lib/analytics'

const KEY = ['coach-formations']

export function useFormations() {
  const queryClient = useQueryClient()
  const list = useQuery({ queryKey: KEY, queryFn: listFormations })
  const refresh = () => queryClient.invalidateQueries({ queryKey: KEY })

  const save = useMutation({
    mutationFn: ({ id, input }: { id?: string | null; input: FormationInput }) =>
      id ? updateFormation(id, input) : createFormation(input),
    onSuccess: (saved, { id }) => {
      trackEvent(id ? 'formation_updated' : 'formation_saved', { formation: saved.formation })
      // Show the result in the list at once, then confirm with the server.
      queryClient.setQueryData<SavedFormation[]>(KEY, prev => [saved, ...(prev ?? []).filter(r => r.id !== saved.id)])
      refresh()
    },
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteFormation(id),
    onSuccess: (_void, id) => {
      trackEvent('formation_deleted', {})
      queryClient.setQueryData<SavedFormation[]>(KEY, prev => (prev ?? []).filter(r => r.id !== id))
      refresh()
    },
  })

  return {
    formations: list.data ?? [],
    loading: list.isLoading,
    error: list.error?.message ?? null,
    save: save.mutateAsync,
    saving: save.isPending,
    saveError: save.error?.message ?? null,
    remove: remove.mutateAsync,
    removing: remove.isPending,
  }
}
