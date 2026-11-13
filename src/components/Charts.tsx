import { useMemo } from 'react';
import { shortMonthName, formatCurrency } from '@/lib/format';
import type { Transaction } from '@/types';

interface BarChartProps {
  transactions: Transaction[];
  months: number;
}

export function IncomeExpenseBarChart({ transactions, months }: BarChartProps) {
  const data = useMemo(() => {
    const now = new Date();
    const buckets: { label: string; income: number; expense: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ label: shortMonthName(d), income: 0, expense: 0 });
    }

    for (const tx of transactions) {
      const txDate = new Date(tx.date);
      for (let i = 0; i < buckets.length; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
        if (txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear()) {
          if (tx.type === 'income') buckets[i].income += Number(tx.amount);
          else buckets[i].expense += Number(tx.amount);
          break;
        }
      }
    }

    return buckets;
  }, [transactions, months]);

  const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1);
  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <div className="relative">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pb-7">
        {gridLines.map((g) => (
          <div key={g} className="flex items-center gap-2">
            <span className="hidden w-10 text-right text-[10px] font-medium text-ink-300 sm:block">
              ${Math.round(maxValue * g / 1000)}k
            </span>
            <div className="h-px flex-1 bg-ink-100" />
          </div>
        ))}
      </div>

      {/* Bars */}
      <div className="relative flex h-64 items-end justify-between gap-2 px-2 pb-7 sm:gap-4">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end justify-center gap-1 sm:gap-1.5">
              <div
                className="group relative w-1/2 max-w-[22px] cursor-pointer rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-400 transition-all duration-300 hover:from-primary-600 hover:to-primary-500"
                style={{ height: `${Math.max((d.income / maxValue) * 100, 2)}%` }}
              >
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-top-9 group-hover:opacity-100">
                  {formatCurrency(d.income)}
                </span>
              </div>
              <div
                className="group relative w-1/2 max-w-[22px] cursor-pointer rounded-t-lg bg-gradient-to-t from-rose-500 to-rose-400 transition-all duration-300 hover:from-rose-600 hover:to-rose-500"
                style={{ height: `${Math.max((d.expense / maxValue) * 100, 2)}%` }}
              >
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-top-9 group-hover:opacity-100">
                  {formatCurrency(d.expense)}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-ink-400">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  total: number;
}

export function SpendingDonutChart({ data, total }: DonutChartProps) {
  const radius = 68;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = data.map((d) => {
    const fraction = total > 0 ? d.value / total : 0;
    const dash = fraction * circumference;
    const segment = {
      ...d,
      dash,
      offset: offset * circumference,
    };
    offset += fraction;
    return segment;
  });

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        {total > 0 && segments.map((s, i) => (
          <circle
            key={i}
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-300">Total</span>
        <span className="mt-0.5 text-xl font-bold tracking-tight text-ink-900">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
