import { useState, useEffect } from 'react';
import { X, Check } from '@/lib/icons';
import { getCategoryIcon } from '@/lib/icons';
import type { SavingsGoal } from '@/types';

interface SavingsGoalModalProps {
  open: boolean;
  editing: SavingsGoal | null;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    target_amount: number;
    color: string;
    icon: string;
    deadline: string | null;
  }) => Promise<void>;
}

const colorOptions = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Slate', value: '#64748b' },
];

const iconOptions = [
  'PiggyBank', 'Plane', 'Home', 'Car', 'Umbrella', 'GraduationCap',
  'Heart', 'Briefcase', 'Shield', 'Star', 'Trophy', 'Anchor',
  'Mountain', 'Palmtree', 'Camera', 'Gamepad2', 'Dog', 'Baby',
  'Diamond', 'Wrench', 'Gift', 'Rocket', 'Wallet', 'Target',
];

export function SavingsGoalModal({ open, editing, onClose, onSubmit }: SavingsGoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [color, setColor] = useState('#10b981');
  const [icon, setIcon] = useState('PiggyBank');
  const [deadline, setDeadline] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        setName(editing.name);
        setTargetAmount(String(editing.target_amount));
        setColor(editing.color);
        setIcon(editing.icon);
        setDeadline(editing.deadline || '');
      } else {
        setName('');
        setTargetAmount('');
        setColor('#10b981');
        setIcon('PiggyBank');
        setDeadline('');
      }
      setError('');
    }
  }, [open, editing]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Enter a goal name');
      return;
    }
    const amt = parseFloat(targetAmount);
    if (!amt || amt <= 0) {
      setError('Enter a valid target amount');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        name: name.trim(),
        target_amount: amt,
        color,
        icon,
        deadline: deadline || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-md" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl animate-slide-up sm:rounded-3xl sm:animate-scale-in scrollbar-thin">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink-900">
              {editing ? 'Edit Goal' : 'New Savings Goal'}
            </h2>
            <p className="text-xs font-medium text-ink-400">Create a custom savings target</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600">
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Goal Name</label>
            <input
              type="text"
              placeholder="e.g. Hawaii Vacation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm font-medium text-ink-900 placeholder-ink-400 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100/50"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Target Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-ink-300">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="5,000.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full rounded-xl border border-ink-200 bg-ink-50/50 py-3 pl-9 pr-4 text-lg font-bold tabular-nums text-ink-900 placeholder-ink-300 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100/50"
              />
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Deadline <span className="font-normal normal-case text-ink-300">(optional)</span></label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-xl border border-ink-200 bg-ink-50/50 px-4 py-3 text-sm font-medium text-ink-900 outline-none transition-all focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100/50"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Choose Icon</label>
            <div className="grid grid-cols-8 gap-2">
              {iconOptions.map((iconName) => {
                const Icon = getCategoryIcon(iconName);
                const selected = icon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
                      selected
                        ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-100'
                        : 'border-ink-200 hover:border-ink-300 hover:bg-ink-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.1} style={{ color: selected ? color : '#94a3b8' }} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-ink-400">Choose Color</label>
            <div className="flex flex-wrap gap-2.5">
              {colorOptions.map((c) => {
                const selected = color === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`relative h-9 w-9 rounded-xl transition-all duration-200 ${
                      selected ? 'ring-2 ring-offset-2 ring-offset-white' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.value, boxShadow: selected ? `0 0 0 2px ${c.value}` : undefined }}
                    title={c.name}
                  >
                    {selected && (
                      <Check className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white" strokeWidth={3} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-semibold text-rose-600">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-ink-200 py-3 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-glow-lg disabled:opacity-50"
            >
              <Check className="h-4 w-4" strokeWidth={2.5} /> {saving ? 'Saving...' : editing ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
