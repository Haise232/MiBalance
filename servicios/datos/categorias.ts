import { supabase } from '../supabase';
import { categoryFromDB } from './comun';
import type { Category } from './tipos';

export const INCOME_CATEGORIES = ['Salario','Freelance','Inversión','Regalo','Otro'] as const;
export const EXPENSE_CATEGORIES = ['Comida','Transporte','Salud','Entretenimiento','Ropa','Servicios','Alquiler','Otro'] as const;

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(type: 'income' | 'expense'): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .eq('tipo', type === 'income' ? 'ingreso' : 'gasto')
    .order('orden', { ascending: true })
    .order('nombre', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(categoryFromDB);
}

export async function addCategory(cat: Omit<Category, 'id'>): Promise<void> {
  const { error } = await supabase.from('categorias').insert([{
    nombre: cat.name,
    tipo: cat.type === 'income' ? 'ingreso' : 'gasto',
    icono: cat.glyph,
    presupuesto: cat.budget,
    orden: cat.sort_order,
  }]);
  if (error) throw error;
}

export async function updateCategory(id: number, name: string, glyph: string, budget: number): Promise<void> {
  const { error } = await supabase.from('categorias').update({ nombre: name, icono: glyph, presupuesto: budget }).eq('id', id);
  if (error) throw error;
}

export async function deleteCategory(id: number): Promise<void> {
  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) throw error;
}
