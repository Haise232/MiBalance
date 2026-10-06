import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContenedorPantalla } from '@/componentes/ContenedorPantalla';
import { AUTOFOCUS_WEB, COMPORTAMIENTO_TECLADO } from '@/constantes/plataforma';
import { Fonts, Radius, useTheme, useWebTexture } from '@/constantes/tema';
import { useDiseno } from '@/hooks/useDiseno';

// ─── AsyncStorage ─────────────────────────────────────────────────────────────

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

export const ONBOARDING_KEY = 'mibalance_onboarding_done';
export const USER_NAME_KEY  = 'mibalance_user_name';
export const USER_PHOTO_KEY = 'mibalance_user_photo';

// ─── Visuals ──────────────────────────────────────────────────────────────────

function EuroVisual() {
  const C = useTheme();
  return (
    <View style={[vStyles.wrap, { backgroundColor: C.accentSoft }]}>
      <Text style={[vStyles.euroGlyph, { color: C.accent, fontFamily: Fonts.serif }]}>€</Text>
    </View>
  );
}

function CardsVisual() {
  const C = useTheme();
  const cards = [
    { label: 'Salario',  amount: '+€2.450', bg: C.posSoft,  fg: C.pos  },
    { label: 'Alquiler', amount: '−€780',   bg: C.negSoft,  fg: C.neg  },
    { label: 'Préstamo', amount: '€120',    bg: C.warnSoft, fg: C.warn },
  ];
  return (
    <View style={vStyles.cardsStack}>
      {cards.map((card, i) => (
        <View key={card.label} style={[vStyles.miniCard, { backgroundColor: C.surface, borderColor: C.line, marginTop: i === 0 ? 0 : -8, zIndex: cards.length - i }]}>
          <View style={[vStyles.miniDot, { backgroundColor: card.bg }]}>
            <Text style={[vStyles.miniDotText, { color: card.fg }]}>{card.amount[0]}</Text>
          </View>
          <Text style={[vStyles.miniLabel, { color: C.ink2 }]}>{card.label}</Text>
          <Text style={[vStyles.miniAmount, { color: card.fg, fontFamily: Fonts.serif }]}>{card.amount}</Text>
        </View>
      ))}
    </View>
  );
}

function CirclesVisual() {
  const C = useTheme();
  return (
    <View style={vStyles.circlesWrap}>
      <View style={[vStyles.circleOuter, { borderColor: C.lineStrong }]}>
        <View style={[vStyles.circleMiddle, { borderColor: C.accent, opacity: 0.5 }]}>
          <View style={[vStyles.circleInner, { backgroundColor: C.accent }]}>
            <Text style={[vStyles.circleText, { color: C.surface, fontFamily: Fonts.serif }]}>€7.4k</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Slide definitions ────────────────────────────────────────────────────────

type Slide = { id: string; Visual: React.FC; title: string; body: string };

const SLIDES: Slide[] = [
  { id: 'calm',    Visual: EuroVisual,    title: 'Tu dinero, en calma.',         body: 'Una vista clara de tus ingresos, gastos y deudas. Sin ruido, sin complicaciones.' },
  { id: 'all-in', Visual: CardsVisual,   title: 'Todo en un sitio.',             body: 'Registra salarios, alquileres y préstamos en segundos. Tu historial siempre a mano.' },
  { id: 'balance',Visual: CirclesVisual, title: 'Mira el balance sin esfuerzo.', body: 'Tu patrimonio neto de un vistazo. Sabe siempre cuánto tienes y hacia dónde vas.' },
];

function SlideItem({ slide, index }: { slide: Slide; index: number }) {
  const C = useTheme();
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(16);

  useEffect(() => {
    opacity.value = 0;
    translateX.value = 16;
    opacity.value = withTiming(1, { duration: 260 });
    translateX.value = withTiming(0, { duration: 260 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.slide, animStyle]}>
      <View style={styles.visualArea}><slide.Visual /></View>
      <Text style={[styles.slideTitle, { color: C.ink, fontFamily: Fonts.serif }]}>{slide.title}</Text>
      <Text style={[styles.slideBody, { color: C.ink3 }]}>{slide.body}</Text>
    </Animated.View>
  );
}

// ─── Welcome overlay (Reanimated) ─────────────────────────────────────────────

interface WelcomeOverlayProps {
  name: string;
  onDone: () => void;
}

function WelcomeOverlay({ name, onDone }: WelcomeOverlayProps) {
  const C = useTheme();

  const opacity   = useSharedValue(0);
  const scale     = useSharedValue(0.88);
  const translateY = useSharedValue(0);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  React.useEffect(() => {
    // Fade + scale in
    opacity.value  = withTiming(1,  { duration: 600 });
    scale.value    = withTiming(1,  { duration: 600 });

    // After 1.4 s → slide up + fade out → navigate
    opacity.value  = withSequence(
      withTiming(1, { duration: 600 }),
      withDelay(900, withTiming(0, { duration: 500 })),
    );
    translateY.value = withDelay(
      1500,
      withTiming(-40, { duration: 500 }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
  }, []);

  const displayName = name.trim() || 'tú';

  return (
    <Animated.View style={[styles.welcomeOverlay, { backgroundColor: C.bg }, overlayStyle]}>
      <View style={[styles.welcomeCircle, { backgroundColor: C.accentSoft }]}>
        <Text style={[styles.welcomeEmoji, { color: C.accent, fontFamily: Fonts.serif }]}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={[styles.welcomeHello, { color: C.ink3 }]}>Bienvenido/a,</Text>
      <Text style={[styles.welcomeName, { color: C.ink, fontFamily: Fonts.serif }]}>
        {displayName}
      </Text>
      <Text style={[styles.welcomeSub, { color: C.ink4 }]}>
        Tu espacio financiero está listo.
      </Text>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const C = useTheme();
  const texture = useWebTexture();
  const router = useRouter();
  const { esAncho: isWide } = useDiseno();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userName, setUserName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      if (!userName.trim()) { setNameError(true); return; }
      saveAndShowWelcome();
    } else {
      setCurrentIndex(i => Math.min(i + 1, SLIDES.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  };

  const saveAndShowWelcome = async () => {
    try {
      if (AsyncStorage) {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        await AsyncStorage.setItem(USER_NAME_KEY, userName.trim());
      }
    } catch {}
    setShowWelcome(true);
  };

  const navigateToApp = () => {
    router.replace('/');
  };

  const content = (
    <>
      <SlideItem slide={SLIDES[currentIndex]} index={currentIndex} />

      {/* Name input — only on last slide */}
      {isLast && (
        <View style={[styles.nameSection, { borderColor: nameError ? C.neg : C.line }]}>
          <Text style={[styles.nameLabel, { color: C.ink4 }]}>¿CÓMO TE LLAMAS?</Text>
          <TextInput
            style={[
              styles.nameInput,
              {
                backgroundColor: C.surface,
                borderColor: nameError ? C.neg : C.lineStrong,
                color: C.ink,
              },
            ]}
            value={userName}
            onChangeText={(t) => { setUserName(t); setNameError(false); }}
            placeholder="Tu nombre"
            placeholderTextColor={C.ink4}
            returnKeyType="done"
            onSubmitEditing={handleNext}
            autoFocus={AUTOFOCUS_WEB}
            maxLength={30}
          />
          {nameError && (
            <Text style={[styles.nameError, { color: C.neg }]}>
              Escribe tu nombre para continuar
            </Text>
          )}
        </View>
      )}

      {/* Dot indicators */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === currentIndex ? C.ink : C.surface3, width: i === currentIndex ? 18 : 6 },
            ]}
          />
        ))}
      </View>

      {/* Nav buttons */}
      <View style={styles.navRow}>
        {currentIndex > 0 && (
          <TouchableOpacity
            style={[styles.backButtonCircle, { borderColor: C.lineStrong }]}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <MaterialIcons name="chevron-left" size={28} color={C.ink3} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButtonCentered, { backgroundColor: C.ink }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[styles.nextButtonText, { color: C.bg }]}>
            {isLast ? 'Empezar' : 'Continuar'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: C.bg }, texture]}>
      <KeyboardAvoidingView style={styles.flex} behavior={COMPORTAMIENTO_TECLADO}>
        {isWide ? (
          <View style={styles.wideOuter}>
            <View style={[styles.wideWrap, { borderColor: C.line }]}>
              <View style={[styles.wideCard, { backgroundColor: C.bg }]}>{content}</View>
              <View style={[styles.wideAside, { backgroundColor: C.accentSoft }]}>
                <Text style={[styles.asideGlyph, { color: C.accent, fontFamily: Fonts.serif }]}>€</Text>
                <Text style={[styles.asideTitle, { color: C.ink, fontFamily: Fonts.serif }]}>
                  Empieza a llevar{'\n'}tus cuentas hoy.
                </Text>
                <Text style={[styles.asideSub, { color: C.ink3 }]}>
                  Ingresos, gastos y balance en un solo lugar, con una vista clara de
                  hacia dónde va tu dinero.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <ContenedorPantalla variante="auth">{content}</ContenedorPantalla>
        )}
      </KeyboardAvoidingView>

      {/* Welcome overlay — renders on top when triggered */}
      {showWelcome && (
        <WelcomeOverlay name={userName} onDone={navigateToApp} />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  slide: { paddingHorizontal: 32, paddingTop: 40, alignItems: 'center' },
  visualArea: { height: 220, justifyContent: 'center', alignItems: 'center', marginBottom: 36 },
  // Wide layout (web / tablet)
  wideOuter: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  wideWrap: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 960,
    minHeight: 600,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 0.5,
  },
  wideCard: { flex: 1, maxWidth: 440, paddingVertical: 24, justifyContent: 'center' },
  wideAside: { flex: 1, justifyContent: 'center', paddingHorizontal: 48 },
  asideGlyph: { fontStyle: 'italic', fontSize: 40, marginBottom: 20 },
  asideTitle: { fontSize: 30, lineHeight: 36, fontWeight: '400', letterSpacing: -0.5, marginBottom: 16 },
  asideSub: { fontSize: 15, lineHeight: 23, maxWidth: 320 },
  slideTitle: { fontSize: 28, fontWeight: '400', textAlign: 'center', marginBottom: 12, lineHeight: 36 },
  slideBody: { fontSize: 15, textAlign: 'center', lineHeight: 24 },
  // Name input
  nameSection: { paddingHorizontal: 24, marginBottom: 4 },
  nameLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, marginBottom: 8 },
  nameInput: {
    borderWidth: 1, borderRadius: Radius.sm,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 17, fontWeight: '400',
  },
  nameError: { fontSize: 12, marginTop: 4 },
  // Dots
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, marginVertical: 20 },
  dot: { height: 6, borderRadius: 3 },
  // Nav
  navRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 24, 
    paddingBottom: 28, 
    position: 'relative',
    height: 80,
  },
  backButtonCircle: { 
    position: 'absolute',
    left: 24,
    bottom: 28,
    width: 52,
    height: 52, 
    borderRadius: 26, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1,
    zIndex: 10,
  },
  nextButtonCentered: { 
    width: 180, 
    height: 52, 
    borderRadius: Radius.pill, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  nextButtonText: { fontSize: 16, fontWeight: '600', letterSpacing: 0.2 },
  // Welcome overlay
  welcomeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    zIndex: 100,
  },
  welcomeCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  welcomeEmoji: { fontSize: 48, lineHeight: 56 },
  welcomeHello: { fontSize: 16, letterSpacing: 0.3 },
  welcomeName: { fontSize: 42, fontWeight: '400', letterSpacing: -0.5 },
  welcomeSub: { fontSize: 14, marginTop: 4 },
});

const vStyles = StyleSheet.create({
  wrap: { width: 130, height: 130, borderRadius: 65, justifyContent: 'center', alignItems: 'center' },
  euroGlyph: { fontSize: 120, lineHeight: 140 },
  cardsStack: { width: 260 },
  miniCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 13, gap: 10, elevation: 3 },
  miniDot: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  miniDotText: { fontSize: 14, fontWeight: '700' },
  miniLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  miniAmount: { fontSize: 15 },
  circlesWrap: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center' },
  circleOuter: { width: 200, height: 200, borderRadius: 100, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  circleMiddle: { width: 150, height: 150, borderRadius: 75, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  circleInner: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  circleText: { fontSize: 22 },
});
