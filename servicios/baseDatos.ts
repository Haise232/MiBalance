// Barrel: la capa de datos vive en ./datos/, dividida por dominio.
// Se mantiene este archivo para que los imports existentes (`@/servicios/baseDatos`) sigan funcionando.
export * from './datos/tipos';
export * from './datos/inicializar';
export * from './datos/movimientos';
export * from './datos/resumen';
export * from './datos/deudas';
export * from './datos/cuentas';
export * from './datos/categorias';
export * from './datos/suscripciones';
export * from './datos/formato';
export * from './datos/respaldo';
