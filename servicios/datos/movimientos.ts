import { supabase } from '../supabase';
import { rangoMes, txFromDB, txToDB } from './comun';
import type { Transaction, TransactionType } from './tipos';

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function getAllTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transacciones')
    .select('*')
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(txFromDB);
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transacciones')
    .select('*')
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(txFromDB);
}

export async function getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
  const tipo = type === 'income' ? 'ingreso' : type === 'expense' ? 'gasto' : 'deuda';
  const { data, error } = await supabase
    .from('transacciones')
    .select('*')
    .eq('tipo', tipo)
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(txFromDB);
}

export async function getTransactionsByMonth(
  year: number,
  month: number,
  type?: TransactionType
): Promise<Transaction[]> {
  const { startDate, endDate } = rangoMes(year, month);

  let q = supabase
    .from('transacciones')
    .select('*')
    .gte('fecha', startDate)
    .lt('fecha', endDate)
    .order('fecha', { ascending: false })
    .order('creado_en', { ascending: false });

  if (type) {
    q = q.eq('tipo', type === 'income' ? 'ingreso' : type === 'expense' ? 'gasto' : 'deuda');
  }

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(txFromDB);
}

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('transacciones').insert([txToDB(transaction)]);
  if (error) throw error;
}

export async function deleteTransaction(id: number): Promise<void> {
  const { error } = await supabase.from('transacciones').delete().eq('id', id);
  if (error) throw error;
}

export async function getTransactionById(id: number): Promise<Transaction | null> {
  const { data, error } = await supabase.from('transacciones').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? txFromDB(data) : null;
}

export async function updateTransaction(id: number, data: Omit<Transaction, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('transacciones').update(txToDB(data)).eq('id', id);
  if (error) throw error;
}
