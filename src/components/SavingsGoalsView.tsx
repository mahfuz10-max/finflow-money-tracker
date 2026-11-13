import { useMemo, useState } from 'react';
import { Plus, Trash2, Target, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Check } from '@/lib/icons';
import { formatCurrency, formatDate } from '@/lib/format';
import { getCategoryIcon } from '@/lib/icons';
import type { SavingsGoal, SavingsContribution } from '@/types';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  contributions: SavingsContribution[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onContribute: (goal: SavingsGoal) => void;
  onDeleteContribution: (id: string) => void;
}

export function SavingsGoalsView({
  goals,
  contributions,
  onAdd,
  onDelete,
  onContribute,
  onDeleteContribution,
}: SavingsGoalsViewProps) {
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);

  const contributionsByGoal = useMemo(() => {
    const map = new Map<string, SavingsContribution[]>();
    for (const c of contributions) {
      const arr = map.get(c.goal_id) || [];
      arr.push(c);
      map.set(c.goal_id, arr);
    }
    return map;
  }, [contributions]);

  const savedByGoal = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of contributions) {
      const current = map.get(c.goal_id) || 0;
      map.set(c.goal_id, current + Number(c.amount));
    }
    return map;
  }, [contributions]);

  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((s, g) => s + (savedByGoal.get(g.id) || 0), 0);

  const daysUntilDeadline = (deadline: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dl = new Date(deadline);
    dl.setHours(0, 0, 0, 0);
    return Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-ink-900">Savings Goals</h1>
          <p className="mt-1 text-sm font-medium text-ink-400">Create targets and track your progress</p>
        </div>
        <button
          onClick={onAdd}
          className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-200 hover:shadow-glow-lg hover:shadow-primary-500/30"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" strokeWidth={2.5} />
          New Goal
        </button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-6 shadow-xl shadow-ink-900/20">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary-500/15 blur-3xl" />
          <div className="absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-accent-500/10 blur-2xl" />
          <div className="relative grid grid-cols-3 gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Total Target</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-white">{formatCurrency(totalTarget)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Total Saved</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-primary-400">{formatCurrency(totalSaved)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Remaining</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-white">
                {formatCurrency(Math.max(totalTarget - totalSaved, 0))}
              </p>
            </div>
          </div>
          {totalTarget > 0 && (
            <div className="relative mt-5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-ink-400">
                <span>Overall Progress</span>
                <span className="text-primary-400">{((totalSaved / totalTarget) * 100).toFixed(0)}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-400 transition-all duration-700"
                  style={{ width: `${Math.min((totalSaved / totalTarget) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Goal cards */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-ink-200/50 bg-white py-20 text-ink-300 shadow-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-50">
            <Target className="h-8 w-8 opacity-40" />
          </div>
          <p className="mt-4 text-base font-bold text-ink-400">No savings goals yet</p>
          <p className="mt-1 text-sm font-medium text-ink-300">Create your first goal to start saving toward it</p>
          <button
            onClick={onAdd}
            className="mt-5 flex items-center gap-2 rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-ink-800 hover:shadow-lg hover:shadow-ink-900/20"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} /> Create a Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {goals.map((goal) => {
            const Icon = getCategoryIcon(goal.icon);
            const saved = savedByGoal.get(goal.id) || 0;
            const target = Number(goal.target_amount);
            const pct = target > 0 ? Math.min((saved / target) * 100, 100) : 0;
            const isComplete = saved >= target;
            const remaining = Math.max(target - saved, 0);
            const goalContribs = contributionsByGoal.get(goal.id) || [];
            const isExpanded = expandedGoal === goal.id;

            const deadlineInfo = goal.deadline ? (() => {
              const days = daysUntilDeadline(goal.deadline);
              if (days < 0) return { label: `${Math.abs(days)}d overdue`, color: 'text-rose-600', bg: 'bg-rose-50' };
              if (days === 0) return { label: 'Due today', color: 'text-amber-600', bg: 'bg-amber-50' };
              if (days <= 30) return { label: `${days}d left`, color: 'text-amber-600', bg: 'bg-amber-50' };
              return { label: `${days}d left`, color: 'text-ink-500', bg: 'bg-ink-50' };
            })() : null;

            return (
              <div
                key={goal.id}
                className="group relative overflow-hidden rounded-3xl border border-ink-200/50 bg-white shadow-card transition-all duration-300 hover:shadow-card-hover"
              >
                {/* Color accent bar */}
                <div className="h-1.5 w-full" style={{ backgroundColor: goal.color }} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: `${goal.color}14` }}
                      >
                        <Icon className="h-6 w-6" strokeWidth={2.1} style={{ color: goal.color }} />
                      </div>
                      <div>
                        <p className="text-base font-bold tracking-tight text-ink-900">{goal.name}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          {isComplete && (
                            <span className="flex items-center gap-1 rounded-md bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-600">
                              <Check className="h-2.5 w-2.5" strokeWidth={3} /> Complete
                            </span>
                          )}
                          {deadlineInfo && (
                            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${deadlineInfo.bg} ${deadlineInfo.color}`}>
                              {deadlineInfo.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(goal.id)}
                      className="rounded-lg p-1.5 text-ink-300 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="mt-5">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-bold tracking-tight text-ink-900">{formatCurrency(saved)}</span>
                        <span className="ml-2 text-sm font-medium text-ink-400">of {formatCurrency(target)}</span>
                      </div>
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{ color: isComplete ? '#10b981' : goal.color }}
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </div>

                    <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(to right, ${goal.color}, ${goal.color}dd)`,
                        }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-500">
                        {remaining > 0 ? `${formatCurrency(remaining)} to go` : 'Goal reached!'}
                      </span>
                      {goal.deadline && remaining > 0 && daysUntilDeadline(goal.deadline) > 0 && (
                        <span className="font-medium text-ink-400">
                          {formatCurrency(remaining / daysUntilDeadline(goal.deadline))}/day to stay on track
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => onContribute(goal)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:shadow-md"
                      style={{ backgroundColor: goal.color }}
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.5} /> Add Money
                    </button>
                    <button
                      onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border border-ink-200 px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        isExpanded ? 'bg-ink-50 text-ink-700' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-700'
                      }`}
                    >
                      {isExpanded ? 'Hide' : 'History'}
                      {isExpanded
                        ? <ChevronLeft className="h-4 w-4 rotate-90" strokeWidth={2.2} />
                        : <ChevronRight className="h-4 w-4 rotate-90" strokeWidth={2.2} />}
                    </button>
                  </div>

                  {/* Contribution history */}
                  {isExpanded && (
                    <div className="mt-4 border-t border-ink-100 pt-4">
                      {goalContribs.length === 0 ? (
                        <p className="py-4 text-center text-sm font-medium text-ink-300">No contributions yet</p>
                      ) : (
                        <div className="max-h-48 space-y-1 overflow-y-auto scrollbar-thin">
                          {goalContribs.map((c) => {
                            const isDeposit = Number(c.amount) >= 0;
                            const ContribIcon = isDeposit ? ArrowUpRight : ArrowDownRight;
                            return (
                              <div
                                key={c.id}
                                className="group/contrib flex items-center justify-between rounded-lg px-2 py-2 transition-colors hover:bg-ink-50"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                    isDeposit ? 'bg-primary-50' : 'bg-rose-50'
                                  }`}>
                                    <ContribIcon
                                      className={`h-3.5 w-3.5 ${isDeposit ? 'text-primary-600' : 'text-rose-600'}`}
                                      strokeWidth={2.5}
                                    />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-ink-900">
                                      {c.note || (isDeposit ? 'Deposit' : 'Withdrawal')}
                                    </p>
                                    <p className="text-[11px] font-medium text-ink-400">
                                      {formatDate(c.created_at.split('T')[0])}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-bold tabular-nums ${
                                    isDeposit ? 'text-primary-600' : 'text-rose-600'
                                  }`}>
                                    {isDeposit ? '+' : ''}{formatCurrency(Number(c.amount))}
                                  </span>
                                  <button
                                    onClick={() => onDeleteContribution(c.id)}
                                    className="rounded p-1 text-ink-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover/contrib:opacity-100"
                                  >
                                    <Trash2 className="h-3 w-3" strokeWidth={2} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
