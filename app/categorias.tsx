import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import { ContenedorPantalla } from '@/componentes/ContenedorPantalla';
import Dialogo from '@/componentes/Dialogo';
import ModalConfirm from '@/componentes/ModalConfirm';
import { AUTOFOCUS_WEB, COMPORTAMIENTO_TECLADO, MOSTRAR_BARRA_SCROLL } from '@/constantes/plataforma';
import { Fonts, Radius, useTheme } from '@/constantes/tema';
import {
  Category,
  CategoryExpense,
  addCategory,
  deleteCategory,
  formatCurrency,
  getCategories,
  getExpensesByCategory,
  updateCategory,
} from '@/servicios/baseDatos';
import { mostrarAviso } from '@/servicios/avisos';

// ─── Available icons ──────────────────────────────────────────────────────────

const ICON_NAMES = [
  'home', 'restaurant', 'directions-car', 'sports-esports', 'local-hospital',
  'build', 'shopping-cart', 'work', 'laptop', 'trending-up', 'card-giftcard',
  'category', 'flight', 'fitness-center', 'local-cafe', 'movie',
  'school', 'pets', 'phone', 'shopping-bag', 'train', 'music-note',
  'attach-money', 'savings', 'star',
  'checkroom', 'subscriptions', 'local-pharmacy', 'dinner-dining',
  'sell', 'undo', 'more-horiz',
] as const;

// Renders a MaterialIcons icon; if the stored name is a legacy symbol, falls back to a default icon
function CategoryIcon({ name, size, color }: { name: string; size: number; color: string }) {
  // Check if it's a valid MaterialIcons name (kebab-case or snake_case)
  const isIcon = name && name.length > 1 && /^[a-z][a-z0-9-_]*$/.test(name);
  if (isIcon) {
    return <MaterialIcons name={name as any} size={size} color={color} />;
  }
  // Fallback for legacy single-char glyphs like '·'
  return <MaterialIcons name="category" size={size} color={color} />;
}

// ─── Progress bar row ─────────────────────────────────────────────────────────

interface BudgetRowProps {
  cat: Category;
  spent: number;
  onEdit: () => void;
  onDelete: () => void;
}

function BudgetRow({ cat, spent, onEdit, onDelete }: BudgetRowProps) {
  const C = useTheme();
  return (
    <View style={[styles.budgetRow, { borderBottomColor: C.line }]}>
      <View style={styles.budgetTop}>
        <View style={styles.budgetLeft}>
          <CategoryIcon name={cat.glyph} size={18} color={C.ink3} />
          <Text style={[styles.budgetName, { color: C.ink }]}>{cat.name}</Text>
        </View>
        <View style={styles.rowActions}>
          <Text style={[styles.budgetSpent, { color: C.ink2, fontFamily: Fonts.serif }]}>
            {formatCurrency(spent)}
          </Text>
          <TouchableOpacity onPress={onEdit} hitSlop={8} style={styles.actionBtn}>
            <Text style={[styles.actionGlyph, { color: C.accent }]}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} hitSlop={8} style={styles.actionBtn}>
            <Text style={[styles.actionGlyph, { color: C.neg }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Income row ───────────────────────────────────────────────────────────────

interface IncomeCatRowProps {
  cat: Category;
  onEdit: () => void;
  onDelete: () => void;
}

function IncomeCatRow({ cat, onEdit, onDelete }: IncomeCatRowProps) {
  const C = useTheme();
  return (
    <View style={[styles.incomeRow, { borderBottomColor: C.line }]}>
      <CategoryIcon name={cat.glyph} size={18} color={C.ink3} />
      <Text style={[styles.incomeName, { color: C.ink, flex: 1 }]}>{cat.name}</Text>
      <TouchableOpacity onPress={onEdit} hitSlop={8} style={styles.actionBtn}>
        <Text style={[styles.actionGlyph, { color: C.accent }]}>✎</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} hitSlop={8} style={styles.actionBtn}>
        <Text style={[styles.actionGlyph, { color: C.neg }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Category form modal ──────────────────────────────────────────────────────

interface CategoryFormProps {
  visible: boolean;
  type: 'income' | 'expense';
  initial?: Category | null;
  onSave: (name: string, glyph: string) => void;
  onCancel: () => void;
}

function CategoryForm({ visible, type, initial, onSave, onCancel }: CategoryFormProps) {
  const C = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [glyph, setGlyph] = useState(initial?.glyph ?? 'category');

  React.useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '');
      setGlyph(initial?.glyph ?? 'category');
    }
  }, [visible, initial]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      mostrarAviso('Nombre requerido', 'Escribe un nombre para la categoría.');
      return;
    }
    onSave(trimmed, glyph);
  };

  return (
    <Dialogo
      visible={visible}
      onClose={onCancel}
      evitarTeclado
      comportamientoTeclado={COMPORTAMIENTO_TECLADO}
      estiloFondo={styles.modalOverlay}
      estiloCaja={[styles.modalBox, { backgroundColor: C.surface, borderColor: C.line }]}
    >
      <Text style={[styles.modalTitle, { color: C.ink }]}>
        {initial ? 'Editar categoría' : 'Nueva categoría'}
      </Text>

      {/* Name */}
      <Text style={[styles.formLabel, { color: C.ink3 }]}>NOMBRE</Text>
      <TextInput
        style={[styles.textInput, { backgroundColor: C.surface2, color: C.ink, borderColor: C.line }]}
        value={name}
        onChangeText={setName}
        placeholder="Ej: Gimnasio"
        placeholderTextColor={C.ink4}
        maxLength={30}
        autoFocus={AUTOFOCUS_WEB}
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />

      {/* Icon picker */}
      <Text style={[styles.formLabel, { color: C.ink3 }]}>ÍCONO</Text>
      <View style={styles.glyphGrid}>
        {ICON_NAMES.map((g) => (
          <TouchableOpacity
            key={g}
            onPress={() => setGlyph(g)}
            style={[
              styles.glyphCell,
              { backgroundColor: glyph === g ? C.ink : C.surface2 },
            ]}
          >
            <MaterialIcons
              name={g as any}
              size={20}
              color={glyph === g ? C.surface : C.ink3}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.modalBtns}>
        <TouchableOpacity
          style={[styles.modalBtn, { backgroundColor: C.surface2 }]}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Text style={[styles.modalBtnText, { color: C.ink2 }]}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalBtn, { backgroundColor: C.accent }]}
          onPress={handleSave}
          activeOpacity={0.7}
        >
          <Text style={[styles.modalBtnText, { color: C.surface }]}>Guardar</Text>
        </TouchableOpacity>
      </View>
    </Dialogo>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type Segment = 'expense' | 'income';

export default function CategoriesScreen() {
  const router = useRouter();
  const C = useTheme();

  const [segment, setSegment] = useState<Segment>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<CategoryExpense[]>([]);
  const [loading, setLoading] = useState(true);

  const [formVisible, setFormVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const now = new Date();
      const [cats, exps] = await Promise.all([
        getCategories(segment),
        getExpensesByCategory(now.getFullYear(), now.getMonth() + 1),
      ]);
      setCategories(cats);
      setExpenses(exps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [segment]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const spentMap = new Map(expenses.map((e) => [e.category, e.total]));

  const openAdd = () => {
    setEditTarget(null);
    setFormVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditTarget(cat);
    setFormVisible(true);
  };

  const handleDelete = (cat: Category) => {
    setDeleteTarget(cat);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
    loadData();
  };

  const handleSave = async (name: string, glyph: string) => {
    if (editTarget) {
      await updateCategory(editTarget.id, name, glyph, 0);
    } else {
      await addCategory({
        name,
        type: segment,
        glyph,
        budget: 0,
        sort_order: categories.length,
      });
    }
    setFormVisible(false);
    loadData();
  };

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
          <Text style={[styles.headerSub, { color: C.ink3 }]}>Categorías</Text>
          <Text style={[styles.headerMain, { color: C.ink }]}>Categorías</Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: C.accent }]}
          onPress={openAdd}
          activeOpacity={0.7}
        >
          <Text style={[styles.addBtnText, { color: C.surface }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentRow}>
        <View style={[styles.segmentContainer, { backgroundColor: C.surface2 }]}>
          {(['expense', 'income'] as Segment[]).map((key) => {
            const active = segment === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.segment,
                  active && [styles.segmentActive, { backgroundColor: C.surface }],
                ]}
                onPress={() => setSegment(key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.segmentLabel, { color: active ? C.ink : C.ink3 }]}>
                  {key === 'expense' ? 'Gastos' : 'Ingresos'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={[styles.flexCenter, { backgroundColor: C.bg }]}>
          <LayerLoader />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={MOSTRAR_BARRA_SCROLL} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
          {categories.length === 0 ? (
            <FadeIn>
              <View style={[styles.emptyCard, { backgroundColor: C.surface, borderColor: C.line }]}>
                <Text style={[styles.emptyText, { color: C.ink3 }]}>
                  Sin categorías. Pulsa + para añadir una.
                </Text>
              </View>
            </FadeIn>
          ) : (
            <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.line }]}>
              {segment === 'expense'
                ? categories.map((cat, index) => (
                    <FadeIn key={cat.id} delay={index * 60}>
                      <BudgetRow
                        cat={cat}
                        spent={spentMap.get(cat.name) ?? 0}
                        onEdit={() => openEdit(cat)}
                        onDelete={() => handleDelete(cat)}
                      />
                    </FadeIn>
                  ))
                : categories.map((cat, index) => (
                    <FadeIn key={cat.id} delay={index * 60}>
                      <IncomeCatRow
                        cat={cat}
                        onEdit={() => openEdit(cat)}
                        onDelete={() => handleDelete(cat)}
                      />
                    </FadeIn>
                  ))}
            </View>
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
      </ContenedorPantalla>

      <CategoryForm
        visible={formVisible}
        type={segment}
        initial={editTarget}
        onSave={handleSave}
        onCancel={() => setFormVisible(false)}
      />

      <ModalConfirm
        visible={!!deleteTarget}
        title="Eliminar categoría"
        message={`¿Eliminar "${deleteTarget?.name}"? Las transacciones existentes no se borrarán.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flexCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: { fontSize: 22, lineHeight: 24 },
  // Segmented
  segmentRow: { paddingHorizontal: 16, paddingVertical: 14 },
  segmentContainer: { flexDirection: 'row', borderRadius: Radius.pill, padding: 4 },
  segment: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.pill },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentLabel: { fontSize: 14, fontWeight: '500' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  card: { borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden' },
  emptyCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  // Budget row
  budgetRow: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1 },
  budgetTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  budgetLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  glyph: { fontSize: 16, width: 20, textAlign: 'center' },
  budgetName: { fontSize: 14, fontWeight: '400', flex: 1 },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  budgetSpent: { fontSize: 12 },
  budgetOf: { fontSize: 11 },
  actionBtn: { padding: 4 },
  actionGlyph: { fontSize: 15 },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  // Income row
  incomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: 1,
  },
  incomeName: { fontSize: 15 },
  bottomSpacer: { height: 40 },
  // Modal
  modalOverlay: {
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: 24,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 20 },
  formLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 14,
  },
  textInput: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  glyphGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  glyphCell: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glyphCellText: { fontSize: 18 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 24 },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.pill,
    alignItems: 'center',
  },
  modalBtnText: { fontSize: 15, fontWeight: '500' },
});
