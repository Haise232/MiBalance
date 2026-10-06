import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Image } from 'expo-image';
import { FadeIn, LayerLoader } from '@/componentes/animaciones';
import ResumenSaldo from '@/componentes/ResumenSaldo';
import ItemMovimiento from '@/componentes/ItemMovimiento';
import { Fonts, Radius, useTheme, useWebTexture } from '@/constantes/tema';
import { ContenedorPantalla } from '@/componentes/ContenedorPantalla';
import { MOSTRAR_BARRA_SCROLL } from '@/constantes/plataforma';
import { useDiseno } from '@/hooks/useDiseno';
import {
  DebtSummary,
  SummaryData,
  Transaction,
  deleteTransaction,
  getDebtSummary,
  getRecentTransactions,
  getSummary,
} from '@/servicios/baseDatos';
import { USER_NAME_KEY, USER_PHOTO_KEY } from '@/app/bienvenida';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 13) return 'Buenos días,';
  if (h < 20) return 'Buenas tardes,';
  return 'Buenas noches,';
}

// ─── Quick Actions Dropdown ───────────────────────────────────────────────────

function QuickActionsMenu({ router }: { router: any }) {
  const C = useTheme();
  const [open, setOpen] = useState(false);
  const animHeight = useRef(new Animated.Value(0)).current;
  const animOpacity = useRef(new Animated.Value(0)).current;
  const animRotate = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    Animated.parallel([
      Animated.timing(animHeight, {
        toValue: next ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(animOpacity, {
        toValue: next ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(animRotate, {
        toValue: next ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const items = [
    { icon: 'account-balance-wallet', label: 'Cuentas', route: '/cuentas' },
    { icon: 'subscriptions', label: 'Suscripciones', route: '/suscripciones' },
    { icon: 'handshake', label: 'Deudas', route: '/deudas' },
  ];

  const height = animHeight.interpolate({ inputRange: [0, 1], outputRange: [0, items.length * 56 + 8] });
  const rotate = animRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={[styles.quickMenuContainer, { backgroundColor: C.surface, borderColor: C.line }]}>
      <TouchableOpacity style={styles.quickMenuTrigger} onPress={toggle} activeOpacity={0.7}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <MaterialIcons name="apps" size={20} color={C.ink2} />
          <Text style={[styles.quickMenuTriggerText, { color: C.ink }]}>Acceso rápido</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <MaterialIcons name="keyboard-arrow-down" size={22} color={C.ink3} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={{ height, opacity: animOpacity, overflow: 'hidden' }}>
        <View style={{ paddingHorizontal: 12, paddingBottom: 8, gap: 4 }}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={[styles.quickMenuItem, { backgroundColor: C.surface2 }]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <MaterialIcons name={item.icon as any} size={18} color={C.ink3} />
              <Text style={[styles.quickMenuItemText, { color: C.ink2 }]}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={18} color={C.ink4} />
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const C = useTheme();
  const texture = useWebTexture();
  const { esAncho: isWide } = useDiseno();

  const [summary, setSummary] = useState<SummaryData>({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    totalAssets: 0,
    currentBalance: 0,
    subscriptionCost: 0,
  });
  const [debtSummary, setDebtSummary] = useState<DebtSummary>({
    totalOwe: 0,
    totalOwedToMe: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [hideAmounts, setHideAmounts] = useState(false);
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryData, recent, debtSum] = await Promise.all([
        getSummary(),
        getRecentTransactions(5),
        getDebtSummary(),
      ]);
      setSummary(summaryData);
      setRecentTransactions(recent);
      setDebtSummary(debtSum);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      // Reload profile on every focus so changes in Settings are reflected
      try {
        const AS = require('@react-native-async-storage/async-storage').default;
        AS.multiGet([USER_NAME_KEY, USER_PHOTO_KEY]).then((pairs: [string, string | null][]) => {
          const name  = pairs.find(p => p[0] === USER_NAME_KEY)?.[1];
          const photo = pairs.find(p => p[0] === USER_PHOTO_KEY)?.[1];
          if (name)  setUserName(name);
          if (photo) setUserPhoto(photo);
        }).catch(() => {});
      } catch (_) {}
    }, [loadData])
  );

  const handleDelete = useCallback(
    async (transaction: Transaction) => {
      try {
        await deleteTransaction(transaction.id);
        await loadData();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    },
    [loadData]
  );

  const handleEdit = useCallback(
    (transaction: Transaction) => {
      router.push(`/agregar?id=${transaction.id}`);
    },
    [router]
  );

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
      <ContenedorPantalla variante="contenido">
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, isWide && styles.contentContainerWide]}
        showsVerticalScrollIndicator={MOSTRAR_BARRA_SCROLL}
      >
        {/* ── Top bar ─────────────────────────────────────────── */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            {/* Avatar */}
            <TouchableOpacity
              style={[styles.avatar, { backgroundColor: C.accent }]}
              onPress={() => router.push('/yo')}
            >
              {userPhoto
                ? <Image source={{ uri: userPhoto }} style={styles.avatarImage} contentFit="cover" />
                : <Text style={[styles.avatarLetter, { color: C.surface }]}>
                    {userName ? userName[0].toUpperCase() : 'M'}
                  </Text>
              }
            </TouchableOpacity>

            <View style={styles.greetingBlock}>
              <Text style={[styles.greetingLabel, { color: C.ink3 }]}>
                {getGreeting()}
              </Text>
              <Text style={[styles.greetingName, { color: C.ink }]}>
                {userName || 'tú'}
              </Text>
            </View>
          </View>

          <View style={styles.topBarRight}>
            {/* Eye toggle */}
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: C.surface2 }]}
              activeOpacity={0.7}
              onPress={() => setHideAmounts(!hideAmounts)}
            >
              <MaterialIcons name={hideAmounts ? 'visibility-off' : 'visibility'} size={18} color={C.ink3} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Hero balance card ────────────────────────────────── */}
        <FadeIn>
          <ResumenSaldo summary={summary} hideAmounts={hideAmounts} />
        </FadeIn>

        {/* ── Stats Row ────────────────────────────────────────── */}
        <FadeIn delay={100}>
          <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: C.surface, borderColor: C.line }]}>
            <View style={styles.statLabelRow}>
              <View style={[styles.dot, { backgroundColor: C.pos }]} />
              <Text style={[styles.statLabel, { color: C.ink3 }]}>Ingresos</Text>
            </View>
            <Text style={[styles.statValue, { color: C.ink, fontFamily: Fonts.serif }]}>
              {hideAmounts ? '€•••' : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(summary.totalIncome)}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: C.surface, borderColor: C.line }]}>
            <View style={styles.statLabelRow}>
              <View style={[styles.dot, { backgroundColor: C.neg }]} />
              <Text style={[styles.statLabel, { color: C.ink3 }]}>Gastos</Text>
            </View>
            <Text style={[styles.statValue, { color: C.ink, fontFamily: Fonts.serif }]}>
              {hideAmounts ? '€•••' : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(summary.totalExpenses)}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: C.surface, borderColor: C.line }]}>
            <View style={styles.statLabelRow}>
              <View style={[styles.dot, { backgroundColor: C.warn }]} />
              <Text style={[styles.statLabel, { color: C.ink3 }]}>Deudas</Text>
            </View>
            <Text style={[styles.statValue, { color: C.ink, fontFamily: Fonts.serif }]}>
              {hideAmounts ? '€•••' : new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(debtSummary.totalOwe)}
            </Text>
          </View>
          </View>
        </FadeIn>

        {/* ── Quick Actions ────────────────────────────────────── */}
        <FadeIn delay={200}>
          <QuickActionsMenu router={router} />
        </FadeIn>

        {/* ── Recent transactions ──────────────────────────────── */}
        <FadeIn delay={400}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.ink, fontFamily: Fonts.serif }]}>
              Movimientos recientes
            </Text>
            {recentTransactions.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/movimientos')}>
                <Text style={[styles.seeAll, { color: C.ink3 }]}>Ver todo →</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentTransactions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: C.surface, borderColor: C.line }]}>
              <Text style={[styles.emptyGlyph, { color: C.ink4 }]}>◎</Text>
              <Text style={[styles.emptyTitle, { color: C.ink2 }]}>Sin movimientos</Text>
              <Text style={[styles.emptySubtitle, { color: C.ink4 }]}>
                Pulsa + en la barra inferior para añadir tu primer movimiento
              </Text>
            </View>
          ) : (
            recentTransactions.map((item) => (
              <ItemMovimiento
                key={item.id}
                transaction={item}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))
          )}

          <View style={styles.bottomSpacer} />
        </FadeIn>
      </ScrollView>
      </ContenedorPantalla>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flexCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  // Reserva espacio para la barra de pestañas flotante (en escritorio hay barra lateral).
  contentContainer: { paddingBottom: 120 },
  contentContainerWide: { paddingBottom: 12 },
  // ── Top bar
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 10 },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: 38, height: 38, borderRadius: 19 },
  avatarLetter: { fontSize: 16, fontWeight: '700' },
  greetingBlock: { gap: 1 },
  greetingLabel: { fontSize: 12 },
  greetingName: { fontSize: 15, fontWeight: '600' },
  iconBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  iconBtnText: { fontSize: 16 },
  // ── Quick Menu
  quickMenuContainer: { marginHorizontal: 16, marginTop: 10, borderRadius: Radius.md, borderWidth: 0.5, overflow: 'hidden' },
  quickMenuTrigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  quickMenuTriggerText: { fontSize: 14, fontWeight: '500' },
  quickMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderRadius: Radius.sm },
  quickMenuItemText: { flex: 1, fontSize: 13, fontWeight: '500' },
  // ── Stats Row
  statsGrid: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 8 },
  statCard: { flex: 1, padding: 12, borderRadius: Radius.md, borderWidth: 0.5 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 16, letterSpacing: -0.5 },
  // ── Section header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 22, fontWeight: '400' },
  seeAll: { fontSize: 13 },
  // ── Empty state
  emptyState: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 32, marginHorizontal: 16, borderRadius: 18, borderWidth: 1 },
  emptyGlyph: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  bottomSpacer: { height: 20 },
});
