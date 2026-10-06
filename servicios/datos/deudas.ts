import { supabase } from '../supabase';
import { debtFromDB, debtToDB } from './comun';
import type { Debt, DebtSummary } from './tipos';

// ─── Debts ────────────────────────────────────────────────────────────────────

export async function getDebts(): Promise<Debt[]> {
  const { data, error } = await supabase
    .from('deudas')
    .select('*')
    .eq('direccion', 'debo')
    .order('vencimiento', { ascending: true, nullsFirst: false })
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(debtFromDB);
}

export async function getDebtsOwedToMe(): Promise<Debt[]> {
  const { data, error } = await supabase
    .from('deudas')
    .select('*')
    .eq('direccion', 'me_deben')
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(debtFromDB);
}

export async function getDebtSummary(): Promise<DebtSummary> {
  const { data, error } = await supabase.from('deudas').select('direccion, total, pagado');
  if (error) throw error;
  const rows = data ?? [];
  return {
    totalOwe:      rows.filter(r => r.direccion === 'debo').reduce((s, r) => s + (r.total - r.pagado), 0),
    totalOwedToMe: rows.filter(r => r.direccion === 'me_deben').reduce((s, r) => s + (r.total - r.pagado), 0),
  };
}

export async function addDebt(debt: Omit<Debt, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('deudas').insert([debtToDB(debt)]);
  if (error) throw error;
}

export async function updateDebtPaid(id: number, paid: number): Promise<void> {
  const { error } = await supabase.from('deudas').update({ pagado: paid }).eq('id', id);
  if (error) throw error;
}

export async function deleteDebt(id: number): Promise<void> {
  const { error } = await supabase.from('deudas').delete().eq('id', id);
  if (error) throw error;
}
