import { StyleSheet } from 'react-native';

import { Radius } from '@/constantes/tema';

// ─── Estilos compartidos por los modales de deudas ────────────────────────────

export const modalStyles = StyleSheet.create({
  modalSafe: { flex: 1 },
  modalColumn: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  modalCancel: { fontSize: 15 },
  modalTitle: { fontSize: 16, fontWeight: '600' },
  modalSave: { fontSize: 15, fontWeight: '600' },
  modalBody: { padding: 20 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  fieldCtl: {
    borderWidth: 0.5,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldInput: { flex: 1, fontSize: 15 },
  fieldAmount: { fontSize: 30, letterSpacing: -1 },
  fieldPrefix: { fontSize: 24 },
  errorText: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});
