import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeIn, LayerLoader } from '@/componentes/animaciones';
import ItemMovimiento from '@/componentes/ItemMovimiento';
import { Fonts, Radius, useTheme, useWebTexture } from '@/constantes/tema';
import { ContenedorPantalla } from '@/componentes/ContenedorPantalla';
import { MOSTRAR_BARRA_SCROLL } from '@/constantes/plataforma';
import { useDiseno } from '@/hooks/useDiseno';
import {
  Transaction,
  TransactionType,
  deleteTransaction,
  getTransactionsByMonth,
} from '@/servicios/baseDatos';

type FilterType = 'all' | TransactionType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'income', label: 'Ingresos' },
  { key: 'expense', label: 'Gastos' },
  { key: 'debt', label: 'Deudas' },
];

// ─── Date group helpers ───────────────────────────────────────────────────────

function formatGroupDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const weekday = new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(date);
  const day = date.getDate();
  const month = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date);
  return `${weekday.toUpperCase()} ${day} ${month.toUpperCase()}`;
}

function getMonthLabel(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function groupByDate(transactions: Transaction[]): { date: string; label: string; items: Transaction[] }[] {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const existing = map.get(t.date);
    if (existing) {
      existing.push(t);
    } else {
      map.set(t.date, [t]);
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, label: formatGroupDate(date), items }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MovimientosScreen() {
  const router = useRouter();
  const C = useTheme();
  const texture = useWebTexture();
  const { esAncho: isWide } = useDiseno();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;

  const loadData = useCallback(
    async () => {
      try {
        setLoading(true);
        const typeFilter = filter === 'all' ? undefined : filter;
        const data = await getTransactionsByMonth(selectedYear, selectedMonth, typeFilter);
        setTransactions(data);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    },
    [filter, selectedYear, selectedMonth]
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

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

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const query = search.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description?.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );
  }, [transactions, search]);

  const groups = useMemo(() => groupByDate(filteredTransactions), [filteredTransactions]);
  const monthLabel = getMonthLabel(selectedYear, selectedMonth);

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
      {/* ── Top bar ──────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.topSubtitle, { color: C.ink3 }]}>Movimientos</Text>
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={goToPrevMonth} hitSlop={12}>
              <MaterialIcons name="chevron-left" size={24} color={C.ink3} />
            </TouchableOpacity>
            <Text style={[styles.topTitle, { color: C.ink, fontFamily: Fonts.serif }]}>
              {monthLabel}
            </Text>
            <TouchableOpacity onPress={goToNextMonth} hitSlop={12} disabled={isCurrentMonth}>
              <MaterialIcons name="chevron-right" size={24} color={isCurrentMonth ? C.ink4 : C.ink3} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Search Bar ───────────────────────────────────────────── */}
      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: C.surface, borderColor: C.line }]}>
          <MaterialIcons name="search" size={20} color={C.ink4} />
          <TextInput
            style={[styles.searchInput, { color: C.ink }]}
            placeholder="Buscar por concepto o categoría..."
            placeholderTextColor={C.ink4}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="cancel" size={18} color={C.ink4} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter chips ─────────────────────────────────────────── */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? C.ink : C.surface,
                  borderColor: active ? C.ink : C.lineStrong,
                },
              ]}
              onPress={() => handleFilterChange(f.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipLabel,
                  { color: active ? C.bg : C.ink3 },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── List ─────────────────────────────────────────────────── */}
      {groups.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: C.surface, borderColor: C.line }]}>
          <Text style={[styles.emptyGlyph, { color: C.ink4 }]}>◎</Text>
          <Text style={[styles.emptyTitle, { color: C.ink2 }]}>Sin resultados</Text>
          <Text style={[styles.emptySubtitle, { color: C.ink4 }]}>
            {search
              ? `No se encontró nada para "${search}"`
              : `No hay movimientos en ${monthLabel.toLowerCase()}.`}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={MOSTRAR_BARRA_SCROLL}
          contentContainerStyle={[styles.listContent, isWide && styles.listContentWide]}
        >
          {groups.map((group, groupIndex) => (
            <FadeIn key={group.date} delay={groupIndex * 80}>
              <View>
                <Text style={[styles.groupLabel, { color: C.ink3 }]}>
                  {group.label}
                </Text>
                {group.items.map((item) => (
                  <ItemMovimiento
                    key={item.id}
                    transaction={item}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </View>
            </FadeIn>
          ))}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
      </ContenedorPantalla>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flexCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  topSubtitle: { fontSize: 12, fontWeight: '500', letterSpacing: 0.4, marginBottom: 2 },
  monthNav: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topTitle: { fontSize: 24, fontWeight: '400' },
  searchRow: { paddingHorizontal: 16, paddingBottom: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 44, borderRadius: Radius.md, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '400' },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 14, gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill, borderWidth: 1 },
  chipLabel: { fontSize: 13, fontWeight: '500' },
  loader: { marginTop: 40 },
  // Reserva espacio para la barra de pestañas flotante (en escritorio hay barra lateral).
  listContent: { paddingBottom: 100 },
  listContentWide: { paddingBottom: 12 },
  groupLabel: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, textTransform: 'uppercase', marginHorizontal: 20, marginTop: 20, marginBottom: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32, marginHorizontal: 16, marginTop: 20, borderRadius: Radius.md, borderWidth: 1 },
  emptyGlyph: { fontSize: 36, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  bottomSpacer: { height: 20 },
});
