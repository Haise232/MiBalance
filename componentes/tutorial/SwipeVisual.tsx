import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radius, useTheme } from '@/constantes/tema';
import { useAnchoTutorial } from './medidas';

// ─── Visual 3: Swipe hint en bucle ────────────────────────────────────────────

export function SwipeVisual() {
  const C = useTheme();
  const W = useAnchoTutorial();
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;
  const editOpacity = useRef(new Animated.Value(0)).current;
  const arrowLeft = useRef(new Animated.Value(0)).current;
  const arrowRight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        // pause
        Animated.delay(600),
        // swipe right (delete hint)
        Animated.parallel([
          Animated.timing(translateX, { toValue: 64, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(deleteOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.delay(700),
        // return
        Animated.parallel([
          Animated.timing(translateX, { toValue: 0, duration: 400, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          Animated.timing(deleteOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
        Animated.delay(500),
        // swipe left (edit hint)
        Animated.parallel([
          Animated.timing(translateX, { toValue: -64, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(editOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.delay(700),
        // return
        Animated.parallel([
          Animated.timing(translateX, { toValue: 0, duration: 400, easing: Easing.in(Easing.ease), useNativeDriver: true }),
          Animated.timing(editOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={v.swipeWrap}>
      {/* Gesture hint arrows */}
      <View style={[v.hintsRow, { width: W * 0.72 }]}>
        <Animated.View style={{ opacity: arrowLeft, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialIcons name="chevron-left" size={16} color={C.neg} />
          <Text style={{ fontSize: 10, color: C.neg, fontWeight: '600' }}>eliminar</Text>
        </Animated.View>
        <Animated.View style={{ opacity: arrowRight, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 10, color: C.accent, fontWeight: '600' }}>editar</Text>
          <MaterialIcons name="chevron-right" size={16} color={C.accent} />
        </Animated.View>
      </View>

      <View style={{ width: W * 0.72, overflow: 'hidden', borderRadius: Radius.md }}>
        {/* Delete action bg */}
        <Animated.View style={[v.swipeBg, v.swipeBgLeft, { backgroundColor: C.neg, opacity: deleteOpacity }]}>
          <MaterialIcons name="delete" size={20} color="#fff" />
          <Text style={v.swipeBgLabel}>Eliminar</Text>
        </Animated.View>

        {/* Edit action bg */}
        <Animated.View style={[v.swipeBg, v.swipeBgRight, { backgroundColor: C.accent, opacity: editOpacity }]}>
          <MaterialIcons name="edit" size={20} color="#fff" />
          <Text style={v.swipeBgLabel}>Editar</Text>
        </Animated.View>

        {/* The row itself */}
        <Animated.View
          style={[
            v.swipeRow,
            { backgroundColor: C.surface, borderColor: C.line },
            { transform: [{ translateX }] },
          ]}
        >
          <View style={[v.swipeIcon, { backgroundColor: C.negSoft }]}>
            <MaterialIcons name="restaurant" size={16} color={C.neg} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[v.swipeTitle, { color: C.ink }]}>Comida</Text>
            <Text style={[v.swipeSub, { color: C.ink4 }]}>15 may</Text>
          </View>
          <Text style={[v.swipeAmt, { color: C.ink2, fontFamily: Fonts.serif }]}>−€24</Text>
        </Animated.View>
      </View>

      <View style={[v.swipeArrows, { width: W * 0.72 }]}>
        <View style={v.arrowHint}>
          <MaterialIcons name="arrow-back" size={14} color={C.neg} />
          <Text style={[v.arrowLabel, { color: C.neg }]}>eliminar</Text>
        </View>
        <View style={[v.arrowHint, { flexDirection: 'row-reverse' }]}>
          <MaterialIcons name="arrow-forward" size={14} color={C.accent} />
          <Text style={[v.arrowLabel, { color: C.accent }]}>editar</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const v = StyleSheet.create({
  swipeWrap: { alignItems: 'center', gap: 8 },
  hintsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  swipeBg: {
    position: 'absolute', top: 0, bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  swipeBgLeft: { left: 0 },
  swipeBgRight: { right: 0 },
  swipeBgLabel: { color: '#fff', fontSize: 9, fontWeight: '600' },
  swipeRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 14,
    borderWidth: 1, borderRadius: Radius.md,
    gap: 10,
  },
  swipeIcon: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  swipeTitle: { fontSize: 14, fontWeight: '500' },
  swipeSub: { fontSize: 11 },
  swipeAmt: { fontSize: 14, fontWeight: '500' },
  swipeArrows: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  arrowHint: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  arrowLabel: { fontSize: 10, fontWeight: '600' },
});
