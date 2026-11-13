import { useState } from 'react';
import { X, Check, ArrowDownRight } from '@/lib/icons';
import { getCategoryIcon } from '@/lib/icons';
import type { SavingsGoal } from '@/types';

interface ContributionModalProps {
  open: boolean;
  goal: SavingsGoal | null;
  onClose: () => void;
  onSubmit: (data: { goal_id: string; amount: number; note: string | null }) => Promise<void>;
}

export function ContributionModal({ open, goal, onClose, onSubmit }: ContributionModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open || !goal) return null;

  const Icon = getCategoryIcon(goal.icon);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt === 0) {
      setError('Enter a valid amount');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        goal_id: goal.id,
        amount: amt,
        note: note.trim() || null,
      });
      setAmount('');
      setNote('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contribution');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-md" onClick={handleClose} />
      <div className="relative w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl animate-slide-up sm:rounded-3xl sm:animate-scale-in">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${goal.color}14` }}
            >
              <Icon className="h-5 w-5" strokeWidth={2.1} style={{ color: goal.color }} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-ink-900">Contribute</h2>
              <p className="text-xs font-medium text-ink-400">{goal.name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600">
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-ink-300">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className={`w-full rounded-2xl border py-4 pl-10 pr-4 text-2xl font-bold tabular-nums outline-none transition-all focus:ring-4 ${
                  parseFloat(amount) < 0
                    ? 'border-rose-300 bg-rose-50/30 text-rose-700 placeholder-rose-300 focus:border-rose-400 focus:bg-white focus:ring-rose-100/50'
                    : 'border-ink-200 bg-ink-50/50 text-ink-900 placeholder-ink-300 focus:border-primary-400 focus:bg-white focus:ring-primary-100/50'
                }`}
              />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-ink-400">
              <ArrowDownRight className="h-3 w-3" />
              Use a negative amount to withdraw
            </p>
          </div>

          {/* Note */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Note <span className="font-normal normal-case text-ink-300">(optional)</span></label>
            <input
              type="text"
              placeholder="e.g. Monthly transfer"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm font-medium text-ink-900 placeholder-ink-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100/50"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-600">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border border-ink-200 py-3 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-glow-lg disabled:opacity-50"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} /> {saving ? 'Saving...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
