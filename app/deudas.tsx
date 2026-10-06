import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import ModalAbono from '@/componentes/deudas/ModalAbono';
import ModalNuevaDeuda from '@/componentes/deudas/ModalNuevaDeuda';
import ResumenDeudas from '@/componentes/deudas/ResumenDeudas';
import { SwipeableOweCard, SwipeableOwedToMeCard } from '@/componentes/deudas/TarjetasDeuda';
import ModalConfirm from '@/componentes/ModalConfirm';
import { MOSTRAR_BARRA_SCROLL } from '@/constantes/plataforma';
import { Fonts, Radius, useTheme, useWebTexture } from '@/constantes/tema';
import {
  Debt,
  DebtSummary,
  deleteDebt,
  getDebtSummary,
  getDebts,
  getDebtsOwedToMe,
  updateDebtPaid,
} from '@/servicios/baseDatos';

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function DebtScreen() {
  const router = useRouter();
  const C = useTheme();
  const texture = useWebTexture();

  const [debts, setDebts] = useState<Debt[]>([]);
  const [owedToMe, setOwedToMe] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<DebtSummary>({ totalOwe: 0, totalOwedToMe: 0 });
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [abonoTarget, setAbonoTarget] = useState<Debt | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [d, otm, s] = await Promise.all([
        getDebts(),
        getDebtsOwedToMe(),
        getDebtSummary(),
      ]);
      setDebts(d);
      setOwedToMe(otm);
      setSummary(s);
    } catch (e) {
      console.error('Error loading debts:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handlePay = (debt: Debt) => {
    setAbonoTarget(debt);
  };

  const handleAbonoConfirm = async (amount: number) => {
    if (!abonoTarget) return;
    const newPaid = Math.min(abonoTarget.total, abonoTarget.paid + amount);
    await updateDebtPaid(abonoTarget.id, newPaid);
    setAbonoTarget(null);
    await loadData();
  };

  const handleDelete = (id: number) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    await deleteDebt(deleteTargetId);
    setDeleteTargetId(null);
    await loadData();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }, texture]}>
      <ContenedorPantalla variante="lista">
        {/* TopBar */}
        <View style={styles.topbar}>
          <View style={styles.topbarLeft}>
            <TouchableOpacity style={[styles.avatarBtn, { borderColor: C.line }]} onPress={() => router.back()}>
              <Text style={[styles.backIcon, { color: C.ink2 }]}>‹</Text>
            </TouchableOpacity>
            <View>
              <Text style={[styles.topbarSub, { color: C.ink3 }]}>Deudas y préstamos</Text>
              <Text style={[styles.topbarTitle, { color: C.ink }]}>Detalle</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.avatarBtn, { borderColor: C.line }]} onPress={() => setAddModalVisible(true)}>
            <Text style={[styles.plusIcon, { color: C.ink }]}>+</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={[styles.flexCenter, { backgroundColor: C.bg }]}>
            <LayerLoader />
          </View>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={MOSTRAR_BARRA_SCROLL} keyboardShouldPersistTaps="handled">
            {/* Summary Grid */}
            <FadeIn>
              <ResumenDeudas summary={summary} oweCount={debts.length} owedToMeCount={owedToMe.length} />
            </FadeIn>

            {/* Lo que debo Section */}
            <View style={styles.sectionHeading}>
              <Text style={[styles.sectionTitle, { color: C.ink, fontFamily: Fonts.serif }]}>Lo que debo</Text>
              <Text style={[styles.sectionSub, { color: C.ink3 }]}>Por vencimiento</Text>
            </View>

            <View style={styles.cardList}>
              {debts.length > 0 ? (
                debts.map((d, index) => (
                  <FadeIn key={d.id} delay={index * 60}>
                    <SwipeableOweCard debt={d} onPay={handlePay} onDelete={handleDelete} />
                  </FadeIn>
                ))
              ) : (
                <FadeIn>
                  <View style={[styles.emptyBox, { backgroundColor: C.surface, borderColor: C.line }]}>
                    <Text style={[styles.emptyText, { color: C.ink4 }]}>No tienes deudas pendientes</Text>
                  </View>
                </FadeIn>
              )}
            </View>

            {/* Lo que me deben Section */}
            <View style={[styles.sectionHeading, { marginTop: 18 }]}>
              <Text style={[styles.sectionTitle, { color: C.ink, fontFamily: Fonts.serif }]}>Lo que me deben</Text>
            </View>

            <View style={styles.cardList}>
              {owedToMe.length > 0 ? (
                owedToMe.map((d, index) => (
                  <FadeIn key={d.id} delay={index * 60}>
                    <SwipeableOwedToMeCard debt={d} onDelete={handleDelete} />
                  </FadeIn>
                ))
              ) : (
                <FadeIn>
                  <View style={[styles.emptyBox, { backgroundColor: C.surface, borderColor: C.line }]}>
                    <Text style={[styles.emptyText, { color: C.ink4 }]}>No tienes préstamos pendientes</Text>
                  </View>
                </FadeIn>
              )}
            </View>

            <FadeIn delay={200}>
              <TouchableOpacity style={[styles.ghostBtn, { borderColor: C.lineStrong }]} onPress={() => setAddModalVisible(true)}>
                <Text style={[styles.ghostBtnText, { color: C.ink }]}>＋ Registrar nueva deuda</Text>
              </TouchableOpacity>
            </FadeIn>

            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </ContenedorPantalla>

      <ModalNuevaDeuda
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={() => { setAddModalVisible(false); loadData(); }}
      />

      <ModalAbono
        visible={abonoTarget !== null}
        debt={abonoTarget}
        onClose={() => setAbonoTarget(null)}
        onConfirm={handleAbonoConfirm}
      />

      <ModalConfirm
        visible={deleteTargetId !== null}
        title="Eliminar deuda"
        message="¿Seguro que quieres eliminar esta deuda? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  safeWide: { alignItems: 'center' },
  column: { flex: 1 },
  columnWide: { width: '100%', maxWidth: 640 },
  flexCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  
  // TopBar
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 24, lineHeight: 28, marginTop: -2 },
  plusIcon: { fontSize: 22, fontWeight: '300' },
  topbarSub: { fontSize: 13 },
  topbarTitle: { fontSize: 15, fontWeight: '500' },

  // Section Headings
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 4,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '400',
  },
  sectionSub: {
    fontSize: 12,
  },

  // Cards
  cardList: { gap: 10 },

  emptyBox: {
    padding: 20,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 13, fontStyle: 'italic' },

  ghostBtn: {
    height: 52,
    borderRadius: 100,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  ghostBtnText: { fontSize: 14, fontWeight: '500' },

});
