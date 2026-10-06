import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FadeIn, LayerLoader } from '@/componentes/animaciones';
import { Fonts, Radius, useTheme, useWebTexture } from '@/constantes/tema';
import { ContenedorPantalla } from '@/componentes/ContenedorPantalla';
import { MOSTRAR_BARRA_SCROLL } from '@/constantes/plataforma';
import { useDiseno } from '@/hooks/useDiseno';
import {
  CategoryExpense,
  MonthlyFlow,
  getExpensesByCategory,
  getMonthlyFlow,
} from '@/servicios/baseDatos';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonthLabel(monthStr: string): string {
  // monthStr: 'YYYY-MM'
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('es-ES', { month: 'short' })
    .format(date)
    .toUpperCase();
}

function getMonthTitle(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date);
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
}

// Build the last N months as 'YYYY-MM' strings (for filling gaps)
function buildLastNMonths(n: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${y}-${m}`);
  }
  return months;
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

const CHART_MAX_HEIGHT = 90;

interface BarChartProps {
  data: MonthlyFlow[];
}

function BarChart({ data }: BarChartProps) {
  const C = useTheme();

  const allMonths = buildLastNMonths(6);
  const dataMap = new Map(data.map((d) => [d.month, d]));

  const filled: MonthlyFlow[] = allMonths.map((m) => ({
    month: m,
    income: dataMap.get(m)?.income ?? 0,
    expenses: dataMap.get(m)?.expenses ?? 0,
  }));

  const maxVal = Math.max(
    ...filled.flatMap((d) => [d.income, d.expenses]),
    1
  );

  return (
    <View>
      <View style={styles.chartArea}>
        {filled.map((item) => {
          const incomeH = Math.max((item.income / maxVal) * CHART_MAX_HEIGHT, item.income > 0 ? 4 : 0);
          const expenseH = Math.max((item.expenses / maxVal) * CHART_MAX_HEIGHT, item.expenses > 0 ? 4 : 0);

          return (
            <View key={item.month} style={styles.barGroup}>
              <View style={styles.barsRow}>
                {/* Income bar */}
                <View style={[styles.barWrapper, { height: CHART_MAX_HEIGHT }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: incomeH,
                        backgroundColor: C.pos,
                        borderRadius: 3,
                      },
                    ]}
                  />
                </View>
                {/* Expense bar */}
                <View style={[styles.barWrapper, { height: CHART_MAX_HEIGHT }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: expenseH,
                        backgroundColor: C.neg,
                        borderRadius: 3,
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={[styles.barLabel, { color: C.ink4 }]}>
                {getMonthLabel(item.month)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.pos }]} />
          <Text style={[styles.legendText, { color: C.ink3 }]}>Ingresos</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: C.neg }]} />
          <Text style={[styles.legendText, { color: C.ink3 }]}>Gastos</Text>
        </View>
      </View>
    </View>
  );
}
// ─── Category rows ────────────────────────────────────────────────────────────

interface CategoryRowsProps {
  data: CategoryExpense[];
}

function CategoryRows({ data }: CategoryRowsProps) {
  const C = useTheme();

  const total = data.reduce((s, d) => s + d.total, 0);

  if (data.length === 0) {
    return (
      <Text style={[styles.emptyNote, { color: C.ink4 }]}>
        Sin gastos este mes
      </Text>
    );
  }

  const barColors = [C.ink, C.accent, C.warn, C.ink3, C.ink4, C.surface3];

  return (
    <View>
      {/* Stacked bar */}
      <View style={[styles.stackedBar, { backgroundColor: C.surface2 }]}>
        {data.map((item, i) => {
          const pct = total > 0 ? (item.total / total) * 100 : 0;
          return (
            <View
              key={item.category}
              style={{
                width: `${pct}%`,
                height: '100%',
                backgroundColor: barColors[i % barColors.length],
              }}
            />
          );
        })}
      </View>

      {/* Category list */}
      <View style={styles.categoryList}>
        {data.map((item, i) => {
          const pct = total > 0 ? (item.total / total) * 100 : 0;
          const color = barColors[i % barColors.length];
          const iconName = (item.glyph && item.glyph.length > 1 && /^[a-z][a-z0-9-_]*$/.test(item.glyph))
            ? item.glyph
            : 'category';

          return (
            <View key={item.category} style={[styles.categoryRow, { borderTopColor: C.line }]}>
              <View style={[styles.categoryIconWrap, { backgroundColor: color + '22' }]}>
                <MaterialIcons name={iconName as any} size={16} color={color} />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[styles.categoryName, { color: C.ink }]}>{item.category}</Text>
                  <Text style={[styles.categoryAmount, { color: C.ink }]}>
                    €{item.total.toLocaleString('es-ES')}
                  </Text>
                </View>
                <View style={[styles.categoryBarTrack, { backgroundColor: C.surface2 }]}>
                  <View style={[styles.categoryBarFill, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
              </View>
              <Text style={[styles.categoryPct, { color: C.ink3 }]}>{pct.toFixed(0)}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ReportesScreen() {
  const C = useTheme();
  const texture = useWebTexture();
  const { esAncho: isWide } = useDiseno();

  const now = new Date();
  const [flow, setFlow] = useState<MonthlyFlow[]>([]);
  const [categories, setCategories] = useState<CategoryExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [flowData, catData] = await Promise.all([
        getMonthlyFlow(6),
        getExpensesByCategory(now.getFullYear(), now.getMonth() + 1),
      ]);
      setFlow(flowData);
      setCategories(catData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.bg }, texture]}>
      <ContenedorPantalla variante="contenido">
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={[styles.topSubtitle, { color: C.ink3 }]}>Reportes</Text>
        <Text style={[styles.topTitle, { color: C.ink, fontFamily: Fonts.serif }]}>
          {getMonthTitle(now.getFullYear(), now.getMonth() + 1)}
        </Text>
      </View>

      {loading ? (
        <View style={[styles.flexCenter, { backgroundColor: C.bg }]}>
          <LayerLoader />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={MOSTRAR_BARRA_SCROLL}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Card 1: Flow chart */}
          <FadeIn>
            <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
              <Text style={[styles.cardTitle, { color: C.ink3 }]}>FLUJO · 6 MESES</Text>
              <BarChart data={flow} />
            </View>
          </FadeIn>

          {/* Card 2: Categories */}
          <FadeIn delay={100}>
            <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
              <Text style={[styles.cardTitle, { color: C.ink3 }]}>POR CATEGORÍA</Text>
              <CategoryRows data={categories} />
            </View>
          </FadeIn>

          <View style={isWide ? styles.bottomSpacerWide : styles.bottomSpacer} />
        </ScrollView>
      )}
      </ContenedorPantalla>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flexCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  topSubtitle: { fontSize: 12, fontWeight: '500', letterSpacing: 0.4, marginBottom: 2 },
  topTitle: { fontSize: 24, fontWeight: '400' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  card: { borderRadius: Radius.md, borderWidth: 1, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 11, fontWeight: '500', letterSpacing: 1.2, marginBottom: 20 },
  // ── Bar chart
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 },
  barGroup: { alignItems: 'center', flex: 1 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginBottom: 6 },
  barWrapper: { width: 10, justifyContent: 'flex-end' },
  bar: { width: 10 },
  barLabel: { fontSize: 9, fontWeight: '500', letterSpacing: 0.3 },
  legend: { flexDirection: 'row', gap: 16, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12 },
  // ── Categories
  stackedBar: { height: 10, borderRadius: 100, flexDirection: 'row', overflow: 'hidden', marginBottom: 14 },
  categoryList: {},
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth },
  categoryIconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  categoryBarTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  categoryBarFill: { height: '100%', borderRadius: 2 },
  categoryName: { fontSize: 13, fontWeight: '500' },
  categoryPct: { fontSize: 11, width: 36, textAlign: 'right' },
  categoryAmount: { fontSize: 15, fontFamily: Fonts.serif },
  emptyNote: { fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  // Reserva espacio para la barra de pestañas flotante (en escritorio hay barra lateral).
  bottomSpacer: { height: 120 },
  bottomSpacerWide: { height: 32 },
});
