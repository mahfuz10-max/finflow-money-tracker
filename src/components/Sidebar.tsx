import { LayoutDashboard, ArrowLeftRight, Target, Wallet2, Sparkles, PiggyBank } from '@/lib/icons';
import type { ViewKey } from '@/types';

interface SidebarProps {
  currentView: ViewKey;
  onNavigate: (view: ViewKey) => void;
  balance: number;
}

const navItems: { key: ViewKey; label: string; icon: typeof LayoutDashboard; desc: string }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview & insights' },
  { key: 'transactions', label: 'Transactions', icon: ArrowLeftRight, desc: 'Income & expenses' },
  { key: 'budgets', label: 'Budgets', icon: Target, desc: 'Spending limits' },
  { key: 'goals', label: 'Savings Goals', icon: PiggyBank, desc: 'Custom targets' },
];

export function Sidebar({ currentView, onNavigate, balance }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-ink-200/60 bg-white/80 backdrop-blur-xl lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-glow">
          <Wallet2 className="h-5.5 w-5.5 text-white" strokeWidth={2.2} />
          <div className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 ring-2 ring-white">
            <Sparkles className="h-2 w-2 text-white" strokeWidth={3} />
          </div>
        </div>
        <div>
          <h1 className="text-[17px] font-bold tracking-tight text-ink-900">FinFlow</h1>
          <p className="text-[11px] font-medium tracking-wide text-ink-400 uppercase">Money Tracker</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5 px-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-ink-300">Menu</p>
        {navItems.map(({ key, label, icon: Icon, desc }) => {
          const active = currentView === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`group relative flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-r from-primary-50 to-accent-50/50 text-primary-700'
                  : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary-500 to-accent-500" />
              )}
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-white text-primary-600 shadow-sm ring-1 ring-primary-100'
                  : 'text-ink-400 group-hover:text-ink-600'
              }`}>
                <Icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
              </div>
              <div className="text-left">
                <span className="block leading-tight">{label}</span>
                <span className={`block text-[11px] font-normal leading-tight ${active ? 'text-primary-400' : 'text-ink-400'}`}>
                  {desc}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Balance card */}
      <div className="p-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-5 shadow-lg shadow-ink-900/20">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary-500/10 blur-2xl" />
          <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-accent-500/10 blur-xl" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10">
                <Wallet2 className="h-3 w-3 text-primary-400" strokeWidth={2.5} />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Total Balance</p>
            </div>
            <p className={`mt-3 text-[26px] font-bold tracking-tight ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(balance)}
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-ink-400">
              <span className={`flex h-1.5 w-1.5 rounded-full ${balance >= 0 ? 'bg-primary-400' : 'bg-rose-400'} animate-pulse`} />
              {balance >= 0 ? 'Healthy balance' : 'Over budget'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
