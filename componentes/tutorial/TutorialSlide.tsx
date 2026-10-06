import { useEffect, useRef, type ComponentType } from 'react';
import { Animated, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Fonts, useTheme } from '@/constantes/tema';

// ─── Slide ────────────────────────────────────────────────────────────────────

export type Slide = {
  id: string;
  Visual: ComponentType;
  title: string;
  body: string;
};

export function TutorialSlide({ slide, index }: { slide: Slide; index: number }) {
  const C = useTheme();
  const { height: winH } = useWindowDimensions();
  // Relativa al alto de ventana, mín. 240 (igual que antes en móvil), máx. 320.
  const visualH = Math.max(240, Math.min(320, Math.round(winH * 0.3)));
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateX.setValue(16);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <Animated.View style={[s.slide, { opacity, transform: [{ translateX }] }]}>
      <View style={[s.visualArea, { height: visualH }]}>
        <slide.Visual />
      </View>
      <Text style={[s.title, { color: C.ink, fontFamily: Fonts.serif }]}>{slide.title}</Text>
      <Text style={[s.body, { color: C.ink3 }]}>{slide.body}</Text>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  slide: {
    paddingHorizontal: 32,
    paddingTop: 24,
    alignItems: 'center',
  },
  visualArea: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});
