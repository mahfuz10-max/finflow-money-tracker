import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { TransactionsView } from '@/components/TransactionsView';
import { BudgetsView } from '@/components/BudgetsView';
import { SavingsGoalsView } from '@/components/SavingsGoalsView';
import { TransactionModal } from '@/components/TransactionModal';
import { BudgetModal } from '@/components/BudgetModal';
import { SavingsGoalModal } from '@/components/SavingsGoalModal';
import { ContributionModal } from '@/components/ContributionModal';
import { useCategories, useTransactions, useBudgets, useSavingsGoals } from '@/hooks/useData';
import { LayoutDashboard, ArrowLeftRight, Target, Plus, Wallet2, PiggyBank } from '@/lib/icons';
import type { ViewKey, Transaction, SavingsGoal } from '@/types';

export default function App() {
  const [view, setView] = useState<ViewKey>('dashboard');
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [contribModalOpen, setContribModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contribGoal, setContribGoal] = useState<SavingsGoal | null>(null);

  const { categories } = useCategories();
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { budgets, addBudget, deleteBudget } = useBudgets();
  const { goals, contributions, addGoal, deleteGoal, addContribution, deleteContribution } = useSavingsGoals();

  const balance = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    return income - expense;
  }, [transactions]);

  const navigate = (v: ViewKey) => setView(v);

  const handleAddTx = () => {
    setEditingTx(null);
    setTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setTxModalOpen(true);
  };

  const handleSubmitTx = async (data: {
    type: 'income' | 'expense';
    amount: number;
    category_id: string | null;
    description: string;
    date: string;
  }) => {
    if (editingTx) {
      await updateTransaction(editingTx.id, data);
    } else {
      await addTransaction(data);
    }
  };

  const handleContribute = (goal: SavingsGoal) => {
    setContribGoal(goal);
    setContribModalOpen(true);
  };

  const navItems = [
    { key: 'dashboard' as const, label: 'Home', icon: LayoutDashboard },
    { key: 'transactions' as const, label: 'Activity', icon: ArrowLeftRight },
    { key: 'budgets' as const, label: 'Budgets', icon: Target },
    { key: 'goals' as const, label: 'Goals', icon: PiggyBank },
  ];

  return (
    <div className="min-h-screen bg-ink-50/50 gradient-mesh">
      <Sidebar currentView={view} onNavigate={navigate} balance={balance} />

      {/* Mobile header */}
      <header className="glass sticky top-0 z-20 flex items-center justify-between border-b border-ink-200/60 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 shadow-lg shadow-primary-500/20">
            <Wallet2 className="h-4.5 w-4.5 text-white" strokeWidth={2.3} />
          </div>
          <div>
            <span className="text-[15px] font-bold tracking-tight text-ink-900">FinFlow</span>
            <p className="text-[10px] font-medium uppercase tracking-wider text-ink-400 -mt-0.5">Money Tracker</p>
          </div>
        </div>
        <button
          onClick={handleAddTx}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white shadow-lg shadow-ink-900/20 transition-transform active:scale-95"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="glass fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-ink-200/60 px-1 pb-[env(safe-area-inset-bottom)] pt-1.5 lg:hidden">
        {navItems.map(({ key, label, icon: Icon }) => {
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => navigate(key)}
              className={`group relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition-colors ${
                active ? 'text-primary-600' : 'text-ink-400'
              }`}
            >
              {active && (
                <span className="absolute -top-1.5 h-1 w-7 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
              )}
              <Icon className={`h-[18px] w-[18px] transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`} strokeWidth={2.1} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="lg:pl-72">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 lg:px-10 lg:py-9">
          {view === 'dashboard' && (
            <Dashboard
              transactions={transactions}
              categories={categories}
              budgets={budgets}
              onAddTransaction={handleAddTx}
            />
          )}
          {view === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              categories={categories}
              onAdd={handleAddTx}
              onEdit={handleEditTx}
              onDelete={deleteTransaction}
            />
          )}
          {view === 'budgets' && (
            <BudgetsView
              budgets={budgets}
              categories={categories}
              transactions={transactions}
              onAdd={() => setBudgetModalOpen(true)}
              onDelete={deleteBudget}
            />
          )}
          {view === 'goals' && (
            <SavingsGoalsView
              goals={goals}
              contributions={contributions}
              onAdd={() => { setEditingGoal(null); setGoalModalOpen(true); }}
              onDelete={deleteGoal}
              onContribute={handleContribute}
              onDeleteContribution={deleteContribution}
            />
          )}
        </div>
      </main>

      <TransactionModal
        open={txModalOpen}
        categories={categories}
        editing={editingTx}
        onClose={() => setTxModalOpen(false)}
        onSubmit={handleSubmitTx}
      />

      <BudgetModal
        open={budgetModalOpen}
        categories={categories}
        existingBudgets={budgets}
        onClose={() => setBudgetModalOpen(false)}
        onSubmit={addBudget}
      />

      <SavingsGoalModal
        open={goalModalOpen}
        editing={editingGoal}
        onClose={() => setGoalModalOpen(false)}
        onSubmit={addGoal}
      />

      <ContributionModal
        open={contribModalOpen}
        goal={contribGoal}
        onClose={() => setContribModalOpen(false)}
        onSubmit={addContribution}
      />
    </div>
  );
}
