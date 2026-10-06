import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

export function FadeIn({ children, delay = 0, duration = 300, style }: FadeInProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style = {} }: SkeletonProps) {
  const shimmer = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [-1, 1],
    outputRange: [-300, 300],
  });

  const baseStyle: ViewStyle = { width: width as any, height: height as any, borderRadius, backgroundColor: 'rgba(130,130,130,0.15)', overflow: 'hidden' };
  return (
    <View style={[baseStyle, style]}>
      <Animated.View
        style={{
          width: '40%',
          height: '100%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

interface SkeletonCardProps {
  style?: ViewStyle;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  return (
    <View style={[{ padding: 16, gap: 12 }, style]}>
      <Skeleton width="60%" height={20} borderRadius={6} />
      <Skeleton width="40%" height={32} borderRadius={6} />
      <Skeleton width="80%" height={12} borderRadius={4} />
    </View>
  );
}

// ─── Coin Loader ──────────────────────────────────────────────────────────────

export function LayerLoader() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 4000,
        easing: Easing.bezier(0, 0.2, 0.8, 1),
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const rotateY = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '3600deg'],
  });

  return (
    <View style={{ width: 64, height: 64, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: '#FFD700',
          borderWidth: 4,
          borderColor: '#DAA520',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 3,
          transform: [
            { perspective: 800 },
            { rotateY },
          ],
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#DAA520',
            lineHeight: 32,
          }}
        >
          $
        </Text>
      </Animated.View>
    </View>
  );
}

export function FullscreenLoader({ bgColor = '#f6f8f2' }: { bgColor?: string }) {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center', zIndex: 999 }]}>
      <LayerLoader />
    </View>
  );
}
