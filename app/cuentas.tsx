import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeIn, LayerLoader } from '@/componentes/animaciones';
import { ContenedorPantalla } from '@/componentes/ContenedorPantalla';
import { AccountCard } from '@/componentes/cuentas/AccountCard';
import { AccountModal, type ModalMode } from '@/componentes/cuentas/AccountModal';
import ModalConfirm from '@/componentes/ModalConfirm';
import { MOSTRAR_BARRA_SCROLL } from '@/constantes/plataforma';
import { Fonts, Radius, useTheme } from '@/constantes/tema';
import {
  Account,
  addAccount,
  deleteAccount,
  formatCurrency,
  getAccounts,
  getTotalAssets,
  updateAccount,
} from '@/servicios/baseDatos';

// ─── Screen ───────────────────────────────────────────────────────────────────

function AccountsScreen() {
  const router = useRouter();
  const C = useTheme();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [editTarget, setEditTarget] = useState<Account | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null);

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [accs, total] = await Promise.all([getAccounts(), getTotalAssets()]);
      setAccounts(accs);
      setTotalAssets(total);
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setModalMode('add');
    setEditTarget(undefined);
    setModalVisible(true);
  };

  const openEditModal = (account: Account) => {
    setModalMode('edit');
    setEditTarget(account);
    setModalVisible(true);
  };

  const handleSave = async (
    name: string,
    type: Account['type'],
    balance: number
  ) => {
    if (modalMode === 'add') {
      await addAccount(name, type, balance);
    } else if (editTarget) {
      await updateAccount(editTarget.id, name, balance);
    }
    await loadData();
  };

  const handleDelete = (account: Account) => {
    setDeleteTarget(account);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAccount(deleteTarget.id);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.bg }]}>
      <ContenedorPantalla variante="lista">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.line }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: C.surface2 }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { color: C.ink2 }]}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={[styles.headerSub, { color: C.ink3 }]}>Cuentas</Text>
          <Text style={[styles.headerMain, { color: C.ink }]}>Mis cuentas</Text>
        </View>

        {/* Spacer to keep title centred */}
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={[styles.flexCenter, { backgroundColor: C.bg }]}>
          <LayerLoader />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={MOSTRAR_BARRA_SCROLL}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Patrimonio neto card */}
          <FadeIn>
            <View
              style={[styles.patrimonioCard, { backgroundColor: C.surface, borderColor: C.line }]}
            >
              <Text style={[styles.patrimonioLabel, { color: C.ink3 }]}>PATRIMONIO NETO</Text>
              <Text
                style={[
                  styles.patrimonioAmount,
                  { color: totalAssets >= 0 ? C.ink : C.neg, fontFamily: Fonts.serif },
                ]}
              >
                {formatCurrency(totalAssets)}
              </Text>
              <Text style={[styles.patrimonioMeta, { color: C.ink3 }]}>
                {accounts.length} {accounts.length === 1 ? 'cuenta activa' : 'cuentas activas'}
              </Text>
            </View>
          </FadeIn>

          {/* Account list */}
          {accounts.map((account, index) => (
            <FadeIn key={account.id} delay={index * 60}>
              <AccountCard account={account} onEdit={openEditModal} onDelete={handleDelete} />
            </FadeIn>
          ))}

          {/* Add account button */}
          <TouchableOpacity
            style={[styles.addBtn, { borderColor: C.lineStrong }]}
            activeOpacity={0.7}
            onPress={openAddModal}
          >
            <Text style={[styles.addBtnText, { color: C.ink3 }]}>+ Añadir cuenta</Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
      </ContenedorPantalla>

      {/* Add / Edit modal */}
      <AccountModal
        visible={modalVisible}
        mode={modalMode}
        initial={editTarget}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />

      <ModalConfirm
        visible={!!deleteTarget}
        title="Eliminar cuenta"
        message={`¿Seguro que quieres eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
}

export default AccountsScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flexCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 20 },
  headerTitles: { alignItems: 'center' },
  headerSub: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  headerMain: { fontSize: 16, fontWeight: '600' },

  // Scroll
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Patrimonio card
  patrimonioCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 22,
    marginBottom: 20,
    alignItems: 'center',
  },
  patrimonioLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  patrimonioAmount: {
    fontSize: 38,
    fontWeight: '400',
    letterSpacing: -1,
  },
  patrimonioMeta: {
    fontSize: 12,
    marginTop: 4,
  },

  // Add button
  addBtn: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  addBtnText: { fontSize: 14, fontWeight: '500' },

  bottomSpacer: { height: 40 },
});
