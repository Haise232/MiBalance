import { supabase } from '../supabase';
import { rangoMes } from './comun';
import { getActiveSubscriptionsMonthlyCost } from './suscripciones';
import type { CategoryExpense, MonthlyFlow, SummaryData } from './tipos';

// ─── Resumen / reportes ───────────────────────────────────────────────────────

export async function getMonthlySummary(year: number, month: number): Promise<SummaryData> {
  const { startDate, endDate } = rangoMes(year, month);

  const [txResult, subCost, assetsResult] = await Promise.all([
    supabase.from('transacciones').select('tipo, importe').gte('fecha', startDate).lt('fecha', endDate),
    getActiveSubscriptionsMonthlyCost(),
    supabase.from('cuentas').select('saldo'),
  ]);
  if (txResult.error) throw txResult.error;

  const rows = txResult.data ?? [];
  const totalIncome   = rows.filter(r => r.tipo === 'ingreso').reduce((s, r) => s + r.importe, 0);
  const totalExpenses = rows.filter(r => r.tipo === 'gasto').reduce((s, r) => s + r.importe, 0) + subCost;
  const totalAssets   = (assetsResult.data ?? []).reduce((s, r) => s + r.saldo, 0);
  const netBalance    = totalIncome - totalExpenses;
  return { totalIncome, totalExpenses, netBalance, totalAssets, currentBalance: totalAssets + netBalance, subscriptionCost: subCost };
}

export async function getSummary(): Promise<SummaryData> {
  const [txResult, subCost, assetsResult] = await Promise.all([
    supabase.from('transacciones').select('tipo, importe'),
    getActiveSubscriptionsMonthlyCost(),
    supabase.from('cuentas').select('saldo'),
  ]);
  if (txResult.error) throw txResult.error;

  const rows = txResult.data ?? [];
  const totalIncome   = rows.filter(r => r.tipo === 'ingreso').reduce((s, r) => s + r.importe, 0);
  const totalExpenses = rows.filter(r => r.tipo === 'gasto').reduce((s, r) => s + r.importe, 0) + subCost;
  const totalAssets   = (assetsResult.data ?? []).reduce((s, r) => s + r.saldo, 0);
  const netBalance    = totalIncome - totalExpenses;
  return { totalIncome, totalExpenses, netBalance, totalAssets, currentBalance: totalAssets + netBalance, subscriptionCost: subCost };
}

export async function getMonthlyFlow(months = 6): Promise<MonthlyFlow[]> {
  const now = new Date();
  const startYear  = now.getMonth() + 1 - (months - 1) <= 0 ? now.getFullYear() - 1 : now.getFullYear();
  const startMonthNum = ((now.getMonth() + 1 - (months - 1) - 1 + 144) % 12) + 1;
  const startDate = `${startYear}-${String(startMonthNum).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('transacciones')
    .select('tipo, importe, fecha')
    .gte('fecha', startDate);
  if (error) throw error;

  const map = new Map<string, { income: number; expenses: number }>();
  for (const r of data ?? []) {
    const key = r.fecha.slice(0, 7);
    const e = map.get(key) ?? { income: 0, expenses: 0 };
    if (r.tipo === 'ingreso') e.income += r.importe;
    if (r.tipo === 'gasto')   e.expenses += r.importe;
    map.set(key, e);
  }

  const result: MonthlyFlow[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    result.push({ month: key, ...(map.get(key) ?? { income: 0, expenses: 0 }) });
  }
  return result;
}

export async function getExpensesByCategory(year: number, month: number): Promise<CategoryExpense[]> {
  const { startDate, endDate } = rangoMes(year, month);

  const [txResult, catResult] = await Promise.all([
    supabase.from('transacciones').select('categoria, importe').eq('tipo', 'gasto').gte('fecha', startDate).lt('fecha', endDate),
    supabase.from('categorias').select('nombre, icono').eq('tipo', 'gasto'),
  ]);
  if (txResult.error) throw txResult.error;
  if (catResult.error) throw catResult.error;

  const glyphMap = new Map<string, string>((catResult.data ?? []).map(c => [c.nombre, c.icono]));
  const totals = new Map<string, number>();
  for (const r of txResult.data ?? []) {
    totals.set(r.categoria, (totals.get(r.categoria) ?? 0) + r.importe);
  }

  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total, glyph: glyphMap.get(category) }))
    .sort((a, b) => b.total - a.total);
}
