import type { Account, Category, Debt, Subscription, Transaction } from './tipos';

// ─── Helpers compartidos ──────────────────────────────────────────────────────

/** Rango [inicio, fin) en formato YYYY-MM-DD para un mes dado (1-12). */
export function rangoMes(year: number, month: number): { startDate: string; endDate: string } {
  const monthStr = String(month).padStart(2, '0');
  const startDate = `${year}-${monthStr}-01`;
  const nm = month === 12 ? 1 : month + 1;
  const ny = month === 12 ? year + 1 : year;
  const endDate = `${ny}-${String(nm).padStart(2, '0')}-01`;
  return { startDate, endDate };
}

// ─── DB ↔ TS Mappers ──────────────────────────────────────────────────────────

export function txFromDB(r: any): Transaction {
  return {
    id: r.id,
    type: r.tipo === 'ingreso' ? 'income' : r.tipo === 'gasto' ? 'expense' : 'debt',
    amount: r.importe,
    category: r.categoria,
    description: r.descripcion ?? null,
    date: r.fecha,
    created_at: r.creado_en ?? '',
  };
}

export function txToDB(t: Omit<Transaction, 'id' | 'created_at'>) {
  return {
    tipo: t.type === 'income' ? 'ingreso' : t.type === 'expense' ? 'gasto' : 'deuda',
    importe: t.amount,
    categoria: t.category,
    descripcion: t.description ?? null,
    fecha: t.date,
  };
}

export function debtFromDB(r: any): Debt {
  return {
    id: r.id,
    direction: r.direccion === 'debo' ? 'owe' : 'owed_to_me',
    who: r.quien,
    what: r.concepto,
    total: r.total,
    paid: r.pagado,
    due_date: r.vencimiento ?? null,
    created_at: r.creado_en ?? '',
  };
}

export function debtToDB(d: Omit<Debt, 'id' | 'created_at'>) {
  return {
    direccion: d.direction === 'owe' ? 'debo' : 'me_deben',
    quien: d.who,
    concepto: d.what,
    total: d.total,
    pagado: d.paid,
    vencimiento: d.due_date ?? null,
  };
}

export function accountFromDB(r: any): Account {
  return {
    id: r.id,
    name: r.nombre,
    type: r.tipo as Account['type'],
    balance: r.saldo,
    color: r.color,
  };
}

export function categoryFromDB(r: any): Category {
  return {
    id: r.id,
    name: r.nombre,
    type: r.tipo === 'ingreso' ? 'income' : 'expense',
    glyph: r.icono,
    budget: r.presupuesto,
    sort_order: r.orden,
  };
}

export function subFromDB(r: any): Subscription {
  return {
    id: r.id,
    name: r.nombre,
    amount: r.importe,
    billing_cycle: r.ciclo === 'mensual' ? 'monthly' : r.ciclo === 'anual' ? 'annual' : 'weekly',
    next_due_date: r.proximo_cobro ?? null,
    icon: r.icono,
    is_active: r.activa === true || r.activa === 1 ? 1 : 0,
    created_at: r.creado_en ?? '',
  };
}
