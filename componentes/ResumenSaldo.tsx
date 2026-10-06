import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts, Radius, useTheme } from '@/constantes/tema';
import { SummaryData } from '@/servicios/baseDatos';

interface BalanceSummaryProps {
  summary: SummaryData;
  hideAmounts?: boolean;
}

// Format integer and decimal parts separately for the large display
function splitAmount(amount: number): { sign: string; integer: string; cents: string } {
  const sign = amount < 0 ? '−' : '';
  const abs = Math.abs(amount);
  const formatted = abs.toFixed(2);
  const [intPart, centPart] = formatted.split('.');
  const intFormatted = Number(intPart).toLocaleString('es-ES');
  return { sign, integer: intFormatted, cents: centPart };
}

function getMonthLabel(): string {
  return new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date());
}

export default function BalanceSummary({ summary, hideAmounts = false }: BalanceSummaryProps) {
  const C = useTheme();

  // Hero: saldos de cuentas + flujo de transacciones
  const { sign, integer, cents } = splitAmount(summary.currentBalance);

  // Delta pill: net flow this month (income - expenses)
  const netFlow = summary.totalIncome - summary.totalExpenses;
  const deltaPositive = netFlow >= 0;
  const base = summary.totalAssets - netFlow;
  const deltaRatio = base !== 0 ? Math.abs(netFlow / base) * 100 : 0;

  const monthLabel = getMonthLabel().toUpperCase();

  return (
    <View style={[styles.hero, { backgroundColor: C.surface, borderColor: C.line }]}>
      <Text style={[styles.label, { color: C.ink3 }]}>
        SALDO TOTAL · {monthLabel}
      </Text>

      <View style={styles.amountContainer}>
        <Text style={[styles.amountText, { color: C.ink, fontFamily: Fonts.serif }]}>
          {sign}€{hideAmounts ? '••••' : (
            <>{integer}<Text style={[styles.centsText, { color: C.ink3 }]}>,{cents}</Text></>
          )}
        </Text>
      </View>

      <View style={styles.deltaRow}>
        <View style={[styles.deltaPill, { backgroundColor: deltaPositive ? C.posSoft : C.negSoft }]}>
          <Text style={[styles.deltaPillText, { color: deltaPositive ? C.pos : C.neg }]}>
            {deltaPositive ? '↑' : '↓'} {deltaRatio.toFixed(1)}%
          </Text>
        </View>
        <Text style={[styles.deltaLabel, { color: C.ink2 }]}>flujo mensual</Text>
      </View>

      {summary.subscriptionCost > 0 && (
        <Text style={[styles.subLabel, { color: C.ink4 }]}>
          Suscripciones: −€{summary.subscriptionCost.toFixed(2)}/mes
        </Text>
      )}

      <View style={[styles.sparklinePlaceholder, { borderBottomColor: C.accent, borderBottomWidth: 1.5, opacity: 0.2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 24,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    shadowColor: 'transparent',
    elevation: 0,
  },
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountText: {
    fontSize: 44,
    letterSpacing: -1.5,
  },
  centsText: {
    fontSize: 22,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  deltaPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  deltaPillText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  deltaLabel: {
    fontSize: 12.5,
  },
  subLabel: {
    fontSize: 11,
    marginTop: 6,
    letterSpacing: 0.2,
  },
  sparklinePlaceholder: {
    marginTop: 14,
    height: 30,
    width: '100%',
  },
});
