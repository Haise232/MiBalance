import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Radius, useTheme } from '@/constantes/tema';
import { formatCurrency } from '@/servicios/baseDatos';

// ─── Summary card ─────────────────────────────────────────────────────────────

interface SubscriptionSummaryProps {
  totalMonthly: number;
  activeCount: number;
}

export default function SubscriptionSummary({ totalMonthly, activeCount }: SubscriptionSummaryProps) {
  const C = useTheme();
  return (
    <View style={[styles.summaryCard, { backgroundColor: C.surface, borderColor: C.line }]}>
      <Text style={[styles.summaryLabel, { color: C.ink3 }]}>COSTE MENSUAL TOTAL</Text>
      <Text style={[styles.summaryAmount, { color: C.ink, fontFamily: Fonts.serif }]}>
        {formatCurrency(totalMonthly)}
      </Text>
      {activeCount > 0 && (
        <Text style={[styles.summaryMeta, { color: C.ink4 }]}>
          {activeCount} suscripci
          {activeCount === 1 ? 'ón activa' : 'ones activas'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '400',
  },
  summaryMeta: {
    fontSize: 12,
    marginTop: 6,
  },
});
