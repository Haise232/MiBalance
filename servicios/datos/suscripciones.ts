import { supabase } from '../supabase';
import { subFromDB } from './comun';
import type { Subscription } from './tipos';

// ─── Subscriptions ────────────────────────────────────────────────────────────

function monthlyAmount(sub: Subscription): number {
  if (sub.billing_cycle === 'annual') return sub.amount / 12;
  if (sub.billing_cycle === 'weekly') return sub.amount * 4.33;
  return sub.amount;
}

export function calcMonthlyAmount(sub: Subscription): number {
  return monthlyAmount(sub);
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await supabase
    .from('suscripciones')
    .select('*')
    .order('activa', { ascending: false })
    .order('nombre', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(subFromDB);
}

export async function addSubscription(data: Omit<Subscription, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('suscripciones').insert([{
    nombre: data.name,
    importe: data.amount,
    ciclo: data.billing_cycle === 'monthly' ? 'mensual' : data.billing_cycle === 'annual' ? 'anual' : 'semanal',
    proximo_cobro: data.next_due_date ?? null,
    icono: data.icon,
    activa: data.is_active === 1,
  }]);
  if (error) throw error;
}

export async function updateSubscription(
  id: number,
  data: Pick<Subscription, 'name' | 'amount' | 'billing_cycle' | 'next_due_date' | 'icon'>
): Promise<void> {
  const { error } = await supabase.from('suscripciones').update({
    nombre: data.name,
    importe: data.amount,
    ciclo: data.billing_cycle === 'monthly' ? 'mensual' : data.billing_cycle === 'annual' ? 'anual' : 'semanal',
    proximo_cobro: data.next_due_date ?? null,
    icono: data.icon,
  }).eq('id', id);
  if (error) throw error;
}

export async function toggleSubscription(id: number, is_active: number): Promise<void> {
  const { error } = await supabase.from('suscripciones').update({ activa: is_active === 1 }).eq('id', id);
  if (error) throw error;
}

export async function deleteSubscription(id: number): Promise<void> {
  const { error } = await supabase.from('suscripciones').delete().eq('id', id);
  if (error) throw error;
}

export async function getActiveSubscriptionsMonthlyCost(): Promise<number> {
  const { data, error } = await supabase.from('suscripciones').select('importe, ciclo, activa');
  if (error) throw error;
  return (data ?? [])
    .filter(r => r.activa === true || r.activa === 1)
    .reduce((s, r) => {
      const amount = r.importe;
      const cycle  = r.ciclo;
      const monthly = cycle === 'anual' ? amount / 12 : cycle === 'semanal' ? amount * 4.33 : amount;
      return s + monthly;
    }, 0);
}
