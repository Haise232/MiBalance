import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MaterialIcons } from '@expo/vector-icons';
import SelectorFecha from '@/componentes/SelectorFecha';
import { Fonts, Radius, useTheme, useWebTexture } from '@/constantes/tema';
import { ContenedorPantalla } from '@/componentes/ContenedorPantalla';
import { AUTOFOCUS_WEB, COMPORTAMIENTO_TECLADO, ES_IOS, MOSTRAR_BARRA_SCROLL } from '@/constantes/plataforma';
import {
  Category,
  Transaction,
  TransactionType,
  addTransaction,
  getCategories,
  getTransactionById,
  getTodayDateString,
  updateTransaction,
} from '@/servicios/baseDatos';
import { mostrarAviso } from '@/servicios/avisos';

// ─── Types ────────────────────────────────────────────────────────────────────

type SegmentKey = TransactionType | 'debt';

const SEGMENTS: { key: SegmentKey; label: string }[] = [
  { key: 'expense', label: 'Gasto' },
  { key: 'income', label: 'Ingreso' },
  { key: 'debt', label: 'Deuda' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTodayLabel(dateString: string): string {
  const today = getTodayDateString();
  const date = new Date(dateString + 'T00:00:00');
  const day = date.getDate();
  const month = new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(date);
  if (dateString === today) {
    return `Hoy, ${day} ${month}`;
  }
  return `${day} ${month} ${date.getFullYear()}`;
}

// ─── Memoized Category Grid ───────────────────────────────────────────────────

interface CategoryGridProps {
  categories: Category[];
  selected: string;
  onSelect: (name: string) => void;
}

const CategoryGrid = React.memo(function CategoryGrid({ categories, selected, onSelect }: CategoryGridProps) {
  const C = useTheme();
  return (
    <View style={styles.categoryGrid}>
      {categories.map((cat) => {
        const active = selected === cat.name;
        const iconName = cat.glyph || 'category';
        return (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.mbChip,
              {
                backgroundColor: active ? C.ink : C.surface,
                borderColor: active ? C.ink : C.line,
              },
            ]}
            onPress={() => onSelect(cat.name)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={iconName as any}
              size={18}
              color={active ? C.bg : C.ink3}
            />
            <Text style={[styles.chipLabel, { color: active ? C.bg : C.ink2 }]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

// ─── Form Component (isolated state) ──────────────────────────────────────────

interface FormProps {
  editTransaction: Transaction | null;
  onSaved: () => void;
}

function TransactionForm({ editTransaction, onSaved }: FormProps) {
  const C = useTheme();
  const isEditing = !!editTransaction;

  const [segment, setSegment] = useState<SegmentKey>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const descriptionRef = useRef<TextInput>(null);

  const type: TransactionType = segment === 'income' ? 'income' : segment === 'debt' ? 'debt' : 'expense';
  const categoryType: 'income' | 'expense' = segment === 'income' ? 'income' : 'expense';

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    getCategories(categoryType).then((rows) => {
      if (!cancelled) setCategories(rows);
    });
    return () => { cancelled = true; };
  }, [categoryType]);

  // Load existing transaction when editing
  useEffect(() => {
    if (!editTransaction) return;
    const tx = editTransaction;
    const seg: SegmentKey = tx.type === 'income' ? 'income' : tx.type === 'debt' ? 'debt' : 'expense';
    setSegment(seg);
    setAmount(String(tx.amount));
    setCategory(tx.category);
    setDescription(tx.description ?? '');
    setDate(tx.date);
  }, [editTransaction]);

  const amountColor = segment === 'income' ? C.pos : segment === 'debt' ? C.warn : C.ink;
  const displaySign = segment === 'income' ? '+' : segment === 'debt' ? '' : '−';

  const handleSegmentChange = useCallback((key: SegmentKey) => {
    setSegment(key);
    setCategory('');
    setCategoryError('');
  }, []);

  const handleAmountChange = useCallback((value: string) => {
    const cleaned = value.replace(',', '.');
    if (/^\d*\.?\d*$/.test(cleaned)) {
      setAmount(value);
      setAmountError('');
    }
  }, []);

  const handleCategorySelect = useCallback((name: string) => {
    setCategory(name);
    setCategoryError('');
  }, []);

  const validate = useCallback((): boolean => {
    let valid = true;
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setAmountError('Introduce un importe válido mayor que 0');
      valid = false;
    }
    if (!category) {
      setCategoryError('Selecciona una categoría');
      valid = false;
    }
    return valid;
  }, [amount, category]);

  const handleSave = useCallback(async () => {
    if (saving) return;
    if (!validate()) return;
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    const data = {
      type,
      amount: parsedAmount,
      category,
      description: description.trim() || null,
      date,
    };
    try {
      setSaving(true);
      if (isEditing && editTransaction) {
        await updateTransaction(editTransaction.id, data);
      } else {
        await addTransaction(data);
      }
      onSaved();
    } catch (error) {
      console.error('Error saving transaction:', error);
      mostrarAviso('Error', 'No se pudo guardar el movimiento. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }, [saving, validate, amount, category, description, date, type, isEditing, editTransaction, onSaved]);

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: 48 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={MOSTRAR_BARRA_SCROLL}
    >
      {/* Segmented control */}
      <View style={[styles.mbSeg, { backgroundColor: C.surface2 }]}>
        {SEGMENTS.map((seg) => {
          const active = segment === seg.key;
          return (
            <TouchableOpacity
              key={seg.key}
              style={[
                styles.segItem,
                active && [styles.segItemActive, { backgroundColor: C.surface }],
              ]}
              onPress={() => handleSegmentChange(seg.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.segLabel, { color: active ? C.ink : C.ink3 }]}>
                {seg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Amount field */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: C.ink3 }]}>IMPORTE</Text>
        <View
          style={[
            styles.fieldCtlAmount,
            {
              backgroundColor: C.surface,
              borderColor: amountError ? C.neg : C.line,
            },
          ]}
        >
          <View style={styles.amountInputRow}>
            <Text style={[styles.amountSign, { color: amountColor, fontFamily: Fonts.serif }]}>
              {displaySign}€
            </Text>
            <TextInput
              style={[styles.amountInput, { color: amountColor, fontFamily: Fonts.serif }]}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0,00"
              placeholderTextColor={C.ink4}
              keyboardType="decimal-pad"
              returnKeyType="next"
              autoFocus={AUTOFOCUS_WEB}
              blurOnSubmit={false}
              onSubmitEditing={() => descriptionRef.current?.focus()}
            />
          </View>
          <Text style={[styles.monoTag, { color: C.ink3 }]}>EUR</Text>
        </View>
        {amountError ? (
          <Text style={[styles.errorText, { color: C.neg }]}>{amountError}</Text>
        ) : null}
      </View>

      {/* Concepto */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: C.ink3 }]}>CONCEPTO</Text>
        <View style={[styles.fieldCtl, { backgroundColor: C.surface, borderColor: C.line }]}>
          <TextInput
            style={[styles.textInput, { color: C.ink }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Añade una nota..."
            placeholderTextColor={C.ink4}
            returnKeyType="done"
            ref={descriptionRef}
            onSubmitEditing={handleSave}
          />
        </View>
      </View>

      {/* Categoría */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: C.ink3 }]}>CATEGORÍA</Text>
        <CategoryGrid categories={categories} selected={category} onSelect={handleCategorySelect} />
        {categoryError ? (
          <Text style={[styles.errorText, { color: C.neg }]}>{categoryError}</Text>
        ) : null}
      </View>

      {/* Fecha */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: C.ink3 }]}>FECHA</Text>
        <TouchableOpacity
          style={[styles.fieldCtl, { backgroundColor: C.surface, borderColor: C.line }]}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.textInput, { color: C.ink, flex: 1 }]}>
            {formatTodayLabel(date)}
          </Text>
          <Text style={[styles.chev, { color: C.ink4 }]}>›</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <View style={{ marginTop: 8 }}>
          <SelectorFecha
            value={date}
            onChange={setDate}
            onCerrar={() => setShowDatePicker(false)}
          />
          {ES_IOS && (
            <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ alignItems: 'center', padding: 12 }}>
              <Text style={{ color: C.accent, fontWeight: '600' }}>Cerrar calendario</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Save button */}
      <TouchableOpacity
        style={[styles.mbBtn, { backgroundColor: C.ink }]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.85}
      >
        {saving ? (
          <ActivityIndicator color={C.bg} />
        ) : (
          <Text style={[styles.mbBtnText, { color: C.bg }]}>
            {isEditing ? 'Guardar cambios' : 'Guardar movimiento'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AddTransactionScreen() {
  const router = useRouter();
  const C = useTheme();
  const texture = useWebTexture();
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!editId;

  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!editId) {
      setEditTransaction(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getTransactionById(Number(editId)).then((tx) => {
      if (!cancelled) {
        setEditTransaction(tx);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [editId]);

  const handleSaved = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.bg }, texture]}>
      <ContenedorPantalla variante="formulario">
      <KeyboardAvoidingView style={styles.flex} behavior={COMPORTAMIENTO_TECLADO}>
        {/* Header */}
        <View style={styles.topbar}>
          <TouchableOpacity
            style={[styles.avatarBtn, { borderColor: C.line }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={[styles.backIcon, { color: C.ink2 }]}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerTitles}>
            <Text style={[styles.topbarSub, { color: C.ink3 }]}>{isEditing ? 'Editar' : 'Nuevo'}</Text>
            <Text style={[styles.topbarTitle, { color: C.ink }]}>Movimiento</Text>
          </View>

          <View style={{ width: 38 }} />
        </View>

        {loading ? (
          <View style={[styles.flex, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator color={C.accent} size="large" />
          </View>
        ) : (
          <TransactionForm editTransaction={editTransaction} onSaved={handleSaved} />
        )}
      </KeyboardAvoidingView>
      </ContenedorPantalla>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  safeAreaWide: { alignItems: 'center' },
  flex: {
    flex: 1,
  },
  columnWide: { width: '100%', maxWidth: 600 },
  // TopBar
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { fontSize: 24, lineHeight: 28, marginTop: -2 },
  headerTitles: {
    alignItems: 'center',
  },
  topbarSub: { fontSize: 13 },
  topbarTitle: { fontSize: 15, fontWeight: '500' },

  // Scroll content
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  // mb-seg
  mbSeg: {
    flexDirection: 'row',
    borderRadius: Radius.pill,
    padding: 4,
    marginBottom: 20,
  },
  segItem: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: Radius.pill,
  },
  segItemActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  segLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Field groups
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  fieldCtl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.sm,
    borderWidth: 0.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fieldCtlAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.sm,
    borderWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
  },
  amountSign: {
    fontSize: 30,
    marginRight: 2,
  },
  amountInput: {
    fontSize: 30,
    flex: 1,
    paddingVertical: 0,
    letterSpacing: -1,
  },
  monoTag: {
    fontSize: 14,
    fontFamily: 'monospace',
    opacity: 0.6,
  },
  textInput: {
    fontSize: 15,
    paddingVertical: 0,
  },
  // Categories
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  mbChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    borderWidth: 0.5,
  },
  chipLabel: {
    fontSize: 12.5,
  },
  chev: {
    fontSize: 20,
    lineHeight: 20,
    marginTop: -2,
  },
  // mb-btn
  mbBtn: {
    marginTop: 8,
    borderRadius: Radius.pill,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mbBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 4,
  },
});
