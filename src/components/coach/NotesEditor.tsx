/**
 * NotesEditor — Ada2AI Coach Components
 *
 * Inline notes editor for coaches. Uses evaluations.notes for persistence.
 * No schema change required — evaluations table already has notes column.
 */
import { useState } from 'react'
import { useCreateEvaluation } from '../../hooks/useEvaluations'
import { Loader2, Save, CheckCircle2, AlertCircle } from 'lucide-react'

interface NotesEditorProps {
  playerId: string
  evaluationId?: string
  initialNotes?: string
  onSaved?: () => void
}

export function NotesEditor({ playerId, evaluationId, initialNotes = '', onSaved }: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes)
  const [saved, setSaved] = useState(false)
  const createEvaluation = useCreateEvaluation()

  const handleSave = async () => {
    if (!notes.trim()) return
    try {
      if (evaluationId) {
        // TODO: Add useUpdateEvaluation hook for UPDATE case
        // For now, create a new evaluation with notes only
        await createEvaluation.mutateAsync({
          player_id: playerId,
          overall: 0,
          notes: notes.trim(),
          evaluation_date: new Date().toISOString().split('T')[0],
          scout_id: '', // will be set by RLS/auth
        } as any)
      } else {
        await createEvaluation.mutateAsync({
          player_id: playerId,
          overall: 0,
          notes: notes.trim(),
          evaluation_date: new Date().toISOString().split('T')[0],
          scout_id: '',
        } as any)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved?.()
    } catch {
      // error is shown via isPending/error state
    }
  }

  return (
    <div className="space-y-2" dir="rtl">
      <textarea
        value={notes}
        onChange={e => { setNotes(e.target.value); setSaved(false) }}
        placeholder="أضف ملاحظاتك هنا..."
        rows={2}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-ice-white text-sm arabic-text focus:outline-none focus:border-teal-prime resize-none placeholder:text-ice-muted/40"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={!notes.trim() || createEvaluation.isPending}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-prime/10 text-teal-prime text-xs arabic-text hover:bg-teal-prime/20 transition-colors disabled:opacity-40"
        >
          {createEvaluation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : saved ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          {saved ? 'تم الحفظ ✓' : 'حفظ'}
        </button>
        {createEvaluation.isError && (
          <span className="text-xs text-red-400 arabic-text flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            فشل الحفظ
          </span>
        )}
      </div>
    </div>
  )
}