import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Radius, useTheme } from '@/constantes/tema';
import { DebtSummary, formatCurrency } from '@/servicios/baseDatos';

// ─── Summary Grid ─────────────────────────────────────────────────────────────

type DebtSummaryGridProps = {
  summary: DebtSummary;
  oweCount: number;
  owedToMeCount: number;
};

export default function DebtSummaryGrid({ summary, oweCount, owedToMeCount }: DebtSummaryGridProps) {
  const C = useTheme();
  return (
    <View style={styles.summaryGrid}>
      <View style={[styles.mbCardTight, { backgroundColor: C.surface, borderColor: C.line }]}>
        <Text style={[styles.labelCaps, { color: C.ink3 }]}>Debo</Text>
        <Text style={[styles.summaryAmountText, { color: C.warn, fontFamily: Fonts.serif }]}>
          {formatCurrency(summary.totalOwe)}
        </Text>
        <Text style={[styles.summaryCountText, { color: C.ink3 }]}>
          {oweCount} {oweCount === 1 ? 'pendiente' : 'pendientes'}
        </Text>
      </View>
      <View style={[styles.mbCardTight, { backgroundColor: C.surface, borderColor: C.line }]}>
        <Text style={[styles.labelCaps, { color: C.ink3 }]}>Me deben</Text>
        <Text style={[styles.summaryAmountText, { color: C.pos, fontFamily: Fonts.serif }]}>
          {formatCurrency(summary.totalOwedToMe)}
        </Text>
        <Text style={[styles.summaryCountText, { color: C.ink3 }]}>
          {owedToMeCount} {owedToMeCount === 1 ? 'préstamo' : 'préstamos'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  mbCardTight: {
    flex: 1,
    padding: 14,
    borderWidth: 0.5,
    borderRadius: Radius.md,
  },
  labelCaps: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryAmountText: {
    fontSize: 28,
    marginTop: 4,
  },
  summaryCountText: {
    fontSize: 11,
    marginTop: 2,
  },
});
