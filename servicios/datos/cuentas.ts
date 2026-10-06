import { supabase } from '../supabase';
import { accountFromDB } from './comun';
import type { Account } from './tipos';

// ─── Accounts ─────────────────────────────────────────────────────────────────

export async function getAccounts(): Promise<Account[]> {
  const { data, error } = await supabase.from('cuentas').select('*').order('id', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(accountFromDB);
}

export async function getTotalAssets(): Promise<number> {
  const { data, error } = await supabase.from('cuentas').select('saldo');
  if (error) throw error;
  return (data ?? []).reduce((s, r) => s + r.saldo, 0);
}

export async function addAccount(name: string, type: Account['type'], balance: number): Promise<void> {
  const { error } = await supabase.from('cuentas').insert([{ nombre: name, tipo: type, saldo: balance, color: 'surface3' }]);
  if (error) throw error;
}

export async function updateAccount(id: number, name: string, balance: number): Promise<void> {
  const { error } = await supabase.from('cuentas').update({ nombre: name, saldo: balance }).eq('id', id);
  if (error) throw error;
}

export async function deleteAccount(id: number): Promise<void> {
  const { error } = await supabase.from('cuentas').delete().eq('id', id);
  if (error) throw error;
}
