import { supabase } from '../supabase';
import { categoryFromDB, debtFromDB } from './comun';
import { getAllTransactions } from './movimientos';
import { getSubscriptions } from './suscripciones';
import type { OldCategory, OldRecord } from './tipos';

// ─── Import from old app ──────────────────────────────────────────────────────

export async function importFromOldApp(jsonData: any): Promise<{ categoriesCount: number; transactionsCount: number; debtsCount: number; subsCount: number }> {
  let categorias: OldCategory[] = [], registros: OldRecord[] = [], deudas: any[] = [], pagosDeuda: any[] = [], suscripciones: any[] = [];

  const table = jsonData.table, data = jsonData.data || [];
  if      (table === 'categorias')                                  categorias    = data;
  else if (table === 'registros' || table === 'registros_v2')       registros     = data;
  else if (table === 'deudas')                                      deudas        = data;
  else if (table === 'deuda_pagos')                                 pagosDeuda    = data;
  else if (table === 'suscripciones')                               suscripciones = data;
  else if (jsonData.data && typeof jsonData.data === 'object' && !Array.isArray(jsonData.data)) {
    categorias = jsonData.data.categorias || []; registros = jsonData.data.registros || [];
    deudas = jsonData.data.deudas || [];         pagosDeuda = jsonData.data.deuda_pagos || [];
    suscripciones = jsonData.data.suscripciones || [];
  } else if (jsonData.categorias || jsonData.registros) {
    categorias = jsonData.categorias || []; registros = jsonData.registros || [];
    deudas = jsonData.deudas || [];         pagosDeuda = jsonData.deuda_pagos || [];
    suscripciones = jsonData.suscripciones || [];
  }

  let categoriesCreated = 0, transactionsImported = 0, debtsImported = 0, subsImported = 0;
  const categoryMap = new Map<number, string>();

  const { data: dbCats } = await supabase.from('categorias').select('id, nombre, tipo');
  const nameMap = new Map<string, string>();
  (dbCats ?? []).forEach(c => nameMap.set(`${c.tipo}_${c.nombre.toLowerCase()}`, c.nombre));

  for (const cat of categorias) {
    const tipo = cat.tipo; // already 'ingreso' or 'gasto'
    const nombre = cat.nombre.trim();
    const existing = nameMap.get(`${tipo}_${nombre.toLowerCase()}`);
    if (existing) {
      categoryMap.set(cat.id, existing);
    } else {
      const { error } = await supabase.from('categorias').insert([{ nombre, tipo, icono: cat.icono || 'category', presupuesto: 0, orden: 0 }]);
      if (!error) { categoryMap.set(cat.id, nombre); nameMap.set(`${tipo}_${nombre.toLowerCase()}`, nombre); categoriesCreated++; }
    }
  }

  if (registros.length > 0) {
    const rows = registros.map(reg => {
      let categoria = categoryMap.get(reg.categoria_id);
      if (!categoria) categoria = reg.tipo === 'ingreso' ? 'Otro' : 'Otros';
      return { tipo: reg.tipo === 'ingreso' ? 'ingreso' : 'gasto', importe: reg.monto, categoria, descripcion: reg.descripcion || null, fecha: reg.fecha, creado_en: reg.created_at };
    });
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from('transacciones').insert(rows.slice(i, i + 500));
      if (!error) transactionsImported += Math.min(500, rows.length - i);
    }
  }

  for (const d of deudas) {
    const { error } = await supabase.from('deudas').insert([{ direccion: d.tipo === 'me_deben' ? 'me_deben' : 'debo', quien: d.persona, concepto: d.descripcion, total: d.monto_total, pagado: 0, vencimiento: d.fecha_vencimiento, creado_en: d.created_at }]);
    if (!error) debtsImported++;
  }

  for (const p of pagosDeuda) {
    if (!p.notas) continue;
    const { data: matched } = await supabase.from('deudas').select('id, pagado').ilike('concepto', `%${p.notas}%`).limit(1).maybeSingle();
    if (matched) await supabase.from('deudas').update({ pagado: matched.pagado + p.monto }).eq('id', matched.id);
  }

  for (const s of suscripciones) {
    const ciclo = s.frecuencia === 'mensual' ? 'mensual' : s.frecuencia === 'anual' ? 'anual' : 'semanal';
    const { error } = await supabase.from('suscripciones').insert([{ nombre: s.nombre, importe: s.monto, ciclo, proximo_cobro: s.fecha_inicio, activa: s.activa !== undefined ? Boolean(s.activa) : true, creado_en: s.created_at }]);
    if (!error) subsImported++;
  }

  return { categoriesCount: categoriesCreated, transactionsCount: transactionsImported, debtsCount: debtsImported, subsCount: subsImported };
}

// ─── Export ───────────────────────────────────────────────────────────────────

export async function exportTransactionsToCSV(): Promise<string> {
  const txs = await getAllTransactions();
  const header = 'ID,Tipo,Importe,Categoría,Descripción,Fecha,Creado en\n';
  const rows = txs.map(t => [t.id, t.type === 'income' ? 'Ingreso' : t.type === 'expense' ? 'Gasto' : 'Deuda', t.amount, `"${t.category}"`, `"${t.description || ''}"`, t.date, t.created_at].join(',')).join('\n');
  return header + rows;
}

export async function exportFullBackupJSON(): Promise<string> {
  const [txs, catR, debtR, subs] = await Promise.all([
    getAllTransactions(),
    supabase.from('categorias').select('*'),
    supabase.from('deudas').select('*'),
    getSubscriptions(),
  ]);
  const categories = (catR.data ?? []).map(categoryFromDB);
  const debts = (debtR.data ?? []).map(debtFromDB);

  return JSON.stringify({
    version: '1.0.0',
    export_date: new Date().toISOString(),
    data: {
      categorias: categories.map(c => ({ id: c.id, nombre: c.name, tipo: c.type === 'income' ? 'ingreso' : 'gasto', icono: c.glyph })),
      registros: txs.map(t => ({ id: t.id, tipo: t.type === 'income' ? 'ingreso' : 'gasto', fecha: t.date, monto: t.amount, descripcion: t.description, categoria_id: 0, categoria_nombre: t.category, created_at: t.created_at })),
      deudas: debts.map(d => ({ id: d.id, tipo: d.direction === 'owed_to_me' ? 'me_deben' : 'debo', persona: d.who, descripcion: d.what, monto_total: d.total, pagado: d.paid, fecha_vencimiento: d.due_date, created_at: d.created_at })),
      suscripciones: subs.map(s => ({ id: s.id, nombre: s.name, monto: s.amount, frecuencia: s.billing_cycle === 'monthly' ? 'mensual' : s.billing_cycle === 'annual' ? 'anual' : 'semanal', fecha_inicio: s.next_due_date, activa: s.is_active, created_at: s.created_at })),
    },
  }, null, 2);
}
