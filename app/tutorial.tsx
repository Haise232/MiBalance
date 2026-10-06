import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BalanceVisual } from '@/componentes/tutorial/BalanceVisual';
import { ChartVisual } from '@/componentes/tutorial/ChartVisual';
import { FabVisual } from '@/componentes/tutorial/FabVisual';
import { MenuVisual } from '@/componentes/tutorial/MenuVisual';
import { PuntosProgreso } from '@/componentes/tutorial/PuntosProgreso';
import { SwipeVisual } from '@/componentes/tutorial/SwipeVisual';
import { TutorialSlide, type Slide } from '@/componentes/tutorial/TutorialSlide';
import { Radius, useTheme, useWebTexture } from '@/constantes/tema';
import { useDiseno } from '@/hooks/useDiseno';

// ─── AsyncStorage ─────────────────────────────────────────────────────────────

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

export const TUTORIAL_DONE_KEY = 'mibalance_tutorial_done';

// ─── Slide definitions ────────────────────────────────────────────────────────

const SLIDES: Slide[] = [
  {
    id: 'balance',
    Visual: BalanceVisual,
    title: 'Tu saldo, siempre visible.',
    body: 'El panel de inicio muestra tu balance total, ingresos y gastos del mes de un solo vistazo.',
  },
  {
    id: 'add',
    Visual: FabVisual,
    title: 'Registra en segundos.',
    body: 'Pulsa el botón + de la barra inferior para añadir un gasto, ingreso o deuda al instante.',
  },
  {
    id: 'swipe',
    Visual: SwipeVisual,
    title: 'Desliza para editar o eliminar.',
    body: 'Arrastra cualquier movimiento hacia la izquierda para editarlo, o hacia la derecha para eliminarlo.',
  },
  {
    id: 'reports',
    Visual: ChartVisual,
    title: 'Entiende tus patrones.',
    body: 'Los reportes muestran tu flujo de los últimos 6 meses y el desglose de gastos por categoría.',
  },
  {
    id: 'quick',
    Visual: MenuVisual,
    title: 'Todo al alcance.',
    body: 'Desde el acceso rápido en Inicio gestiona tus cuentas, suscripciones y deudas con un toque.',
  },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TutorialScreen() {
  const C = useTheme();
  const texture = useWebTexture();
  const router = useRouter();
  const { esAncho: isWide } = useDiseno();
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLast = currentIndex === SLIDES.length - 1;

  const finish = async () => {
    try {
      if (AsyncStorage) await AsyncStorage.setItem(TUTORIAL_DONE_KEY, 'true');
    } catch {}
    router.replace('/');
  };

  const handleNext = () => {
    if (isLast) {
      finish();
    } else {
      setCurrentIndex(i => Math.min(i + 1, SLIDES.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  };

  const content = (
    <>
      {/* Omitir */}
      {!isLast && (
        <TouchableOpacity style={[s.skipBtn, isWide && s.skipBtnWide]} onPress={finish} activeOpacity={0.7}>
          <Text style={[s.skipText, { color: C.ink4 }]}>Omitir</Text>
        </TouchableOpacity>
      )}

      {/* Step label — wide only */}
      {isWide && (
        <Text style={[s.stepLabel, { color: C.ink4 }]}>
          PASO {currentIndex + 1} DE {SLIDES.length}
        </Text>
      )}

      {/* Carousel */}
      <View style={{ flex: 1 }}>
        <TutorialSlide slide={SLIDES[currentIndex]} index={currentIndex} />
      </View>

      {/* Dots */}
      <PuntosProgreso total={SLIDES.length} actual={currentIndex} />

      {/* Nav buttons */}
      <View style={s.navRow}>
        {currentIndex > 0 && (
          <TouchableOpacity
            style={[s.backBtn, { borderColor: C.lineStrong }]}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <MaterialIcons name="chevron-left" size={28} color={C.ink3} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[s.nextBtn, { backgroundColor: C.ink }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[s.nextText, { color: C.bg }]}>
            {isLast ? 'Empezar' : 'Siguiente'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: C.bg }, texture]}>
      {isWide ? (
        <View style={s.wideOuter}>
          <View style={[s.wideCard, { borderColor: C.line, backgroundColor: C.surface }]}>
            {content}
          </View>
        </View>
      ) : content}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1 },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  skipText: { fontSize: 14 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 28,
    height: 80,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 24,
    bottom: 28,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  nextBtn: {
    width: 180,
    height: 52,
    borderRadius: Radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: { fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  // Wide layout (web / tablet)
  wideOuter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  wideCard: {
    flex: 1,
    width: '100%',
    maxWidth: 620,
    maxHeight: 680,
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    paddingTop: 24,
    paddingBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  skipBtnWide: { top: 20, right: 20 },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.4,
    textAlign: 'center',
    marginTop: 4,
  },
});
