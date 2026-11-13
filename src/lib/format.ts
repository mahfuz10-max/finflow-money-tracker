export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatMonth(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(d);
}

export function getMonthStart(date: Date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

export function getMonthEnd(date: Date = new Date()): string {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
}

export function getMonthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthsBack(months: number): Date[] {
  const now = new Date();
  const dates: Date[] = [];
  for (let i = months - 1; i >= 0; i--) {
    dates.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  return dates;
}

export function shortMonthName(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
}
