import { supabase } from '../supabase';

// ─── Init / Seed ──────────────────────────────────────────────────────────────

let isInitialized = false;

export async function initDatabase(): Promise<void> {
  if (isInitialized) {
    console.log('[DB] Already initialized, skipping.');
    return;
  }
  console.log('[DB] Seeding default data if needed...');
  try {
    const { count: accCount } = await supabase
      .from('cuentas')
      .select('*', { count: 'exact', head: true });

    if ((accCount ?? 0) === 0) {
      await supabase.from('cuentas').insert([
        { nombre: 'Efectivo', tipo: 'cash',  saldo: 0, color: 'surface3' },
        { nombre: 'Banco',    tipo: 'bank',  saldo: 0, color: 'surface3' },
        { nombre: 'Tarjeta',  tipo: 'card',  saldo: 0, color: 'surface3' },
      ]);
    }

    const { count: catCount } = await supabase
      .from('categorias')
      .select('*', { count: 'exact', head: true });

    if ((catCount ?? 0) === 0) {
      await supabase.from('categorias').insert([
        { nombre: 'Alquiler',      tipo: 'gasto',   icono: 'home',           presupuesto: 800, orden: 0 },
        { nombre: 'Comida',        tipo: 'gasto',   icono: 'restaurant',     presupuesto: 400, orden: 1 },
        { nombre: 'Transporte',    tipo: 'gasto',   icono: 'directions-car', presupuesto: 120, orden: 2 },
        { nombre: 'Ocio',          tipo: 'gasto',   icono: 'sports-esports', presupuesto: 200, orden: 3 },
        { nombre: 'Salud',         tipo: 'gasto',   icono: 'local-hospital', presupuesto: 100, orden: 4 },
        { nombre: 'Servicios',     tipo: 'gasto',   icono: 'build',          presupuesto: 150, orden: 5 },
        { nombre: 'Mercado',       tipo: 'gasto',   icono: 'shopping-cart',  presupuesto: 300, orden: 6 },
        { nombre: 'Ropa',          tipo: 'gasto',   icono: 'checkroom',      presupuesto: 100, orden: 8 },
        { nombre: 'Suscripciones', tipo: 'gasto',   icono: 'subscriptions',  presupuesto: 50,  orden: 9 },
        { nombre: 'Farmacia',      tipo: 'gasto',   icono: 'local-pharmacy', presupuesto: 60,  orden: 10 },
        { nombre: 'Restaurantes',  tipo: 'gasto',   icono: 'dinner-dining',  presupuesto: 150, orden: 11 },
        { nombre: 'Viajes',        tipo: 'gasto',   icono: 'flight',         presupuesto: 300, orden: 12 },
        { nombre: 'Educación',     tipo: 'gasto',   icono: 'school',         presupuesto: 100, orden: 13 },
        { nombre: 'Mascotas',      tipo: 'gasto',   icono: 'pets',           presupuesto: 80,  orden: 14 },
        { nombre: 'Otros',         tipo: 'gasto',   icono: 'more-horiz',     presupuesto: 200, orden: 15 },
        { nombre: 'Salario',       tipo: 'ingreso', icono: 'work',           presupuesto: 0,   orden: 0 },
        { nombre: 'Freelance',     tipo: 'ingreso', icono: 'laptop',         presupuesto: 0,   orden: 1 },
        { nombre: 'Inversión',     tipo: 'ingreso', icono: 'trending-up',    presupuesto: 0,   orden: 2 },
        { nombre: 'Regalo',        tipo: 'ingreso', icono: 'card-giftcard',  presupuesto: 0,   orden: 3 },
        { nombre: 'Venta',         tipo: 'ingreso', icono: 'sell',           presupuesto: 0,   orden: 4 },
        { nombre: 'Reembolso',     tipo: 'ingreso', icono: 'undo',           presupuesto: 0,   orden: 5 },
        { nombre: 'Otro',          tipo: 'ingreso', icono: 'category',       presupuesto: 0,   orden: 6 },
      ]);
    }

    isInitialized = true;
    console.log('[DB] Supabase database ready.');
  } catch (error) {
    console.error('[DB] Error during initialization:', error);
    throw error;
  }
}
