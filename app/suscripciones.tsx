import { MaterialIcons } from '@expo/vector-icons';
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
import ModalConfirm from '@/componentes/ModalConfirm';
import FilaSuscripcion from '@/componentes/suscripciones/FilaSuscripcion';
import FormularioSuscripcion from '@/componentes/suscripciones/FormularioSuscripcion';
import ResumenSuscripciones from '@/componentes/suscripciones/ResumenSuscripciones';
import { MOSTRAR_BARRA_SCROLL } from '@/constantes/plataforma';
import { Radius, useTheme, useWebTexture } from '@/constantes/tema';
import {
  Subscription,
  addSubscription,
  calcMonthlyAmount,
  deleteSubscription,
  getSubscriptions,
  toggleSubscription,
  updateSubscription,
} from '@/servicios/baseDatos';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SubscriptionsScreen() {
  const router = useRouter();
  const C = useTheme();
  const texture = useWebTexture();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Subscription | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const subs = await getSubscriptions();
      setSubscriptions(subs);
    } catch (e) {
      console.error('Error loading subscriptions:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  // Total monthly cost of active subscriptions
  const activeSubs = subscriptions.filter((s) => s.is_active === 1);
  const totalMonthly = activeSubs.reduce((acc, s) => acc + calcMonthlyAmount(s), 0);

  const openAdd = () => {
    setEditTarget(null);
    setFormVisible(true);
  };

  const openEdit = (sub: Subscription) => {
    setEditTarget(sub);
    setFormVisible(true);
  };

  const handleSave = async (data: Omit<Subscription, 'id' | 'created_at'>) => {
    if (editTarget) {
      await updateSubscription(editTarget.id, {
        name: data.name,
        amount: data.amount,
        billing_cycle: data.billing_cycle,
        next_due_date: data.next_due_date,
        icon: data.icon,
      });
    } else {
      await addSubscription(data);
    }
    setFormVisible(false);
    await loadData();
  };

  const handleToggle = async (sub: Subscription) => {
    await toggleSubscription(sub.id, sub.is_active === 1 ? 0 : 1);
    await loadData();
  };

  const handleDelete = (sub: Subscription) => {
    setDeleteTarget(sub);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteSubscription(deleteTarget.id);
    setDeleteTarget(null);
    await loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: C.bg }, texture]}>
        <View style={[styles.flexCenter, { backgroundColor: C.bg }]}>
          <LayerLoader />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.bg }, texture]}>
      <ContenedorPantalla variante="lista">
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: C.line }]}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: C.surface2 }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={20} color={C.ink2} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: C.ink }]}>Suscripciones</Text>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: C.accent }]}
            onPress={openAdd}
            activeOpacity={0.7}
          >
            <Text style={[styles.addBtnText, { color: C.surface }]}>+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={MOSTRAR_BARRA_SCROLL}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Summary card */}
          <FadeIn>
            <ResumenSuscripciones totalMonthly={totalMonthly} activeCount={activeSubs.length} />
          </FadeIn>

          {/* List */}
          {subscriptions.length === 0 ? (
            <FadeIn>
              <View style={[styles.emptyCard, { backgroundColor: C.surface, borderColor: C.line }]}>
                <MaterialIcons name="subscriptions" size={36} color={C.ink4} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyTitle, { color: C.ink2 }]}>Sin suscripciones</Text>
                <Text style={[styles.emptySubtitle, { color: C.ink4 }]}>
                  Pulsa + para registrar tu primera suscripción
                </Text>
              </View>
            </FadeIn>
          ) : (
            <>
              {subscriptions.map((sub, index) => (
                <FadeIn key={sub.id} delay={index * 60}>
                  <FilaSuscripcion
                    sub={sub}
                    onEdit={() => openEdit(sub)}
                    onToggle={() => handleToggle(sub)}
                    onDelete={() => handleDelete(sub)}
                  />
                </FadeIn>
              ))}
            </>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </ContenedorPantalla>

      <FormularioSuscripcion
        visible={formVisible}
        initial={editTarget}
        onSave={handleSave}
        onCancel={() => setFormVisible(false)}
      />

      <ModalConfirm
        visible={!!deleteTarget}
        title="Eliminar suscripción"
        message={`¿Eliminar "${deleteTarget?.name}" permanentemente?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  safeAreaWide: { alignItems: 'center' },
  column: { flex: 1 },
  columnWide: { width: '100%', maxWidth: 640 },
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { fontSize: 22, lineHeight: 24 },

  // Scroll
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  // Empty state
  emptyCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 36,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  bottomSpacer: { height: 40 },

});
