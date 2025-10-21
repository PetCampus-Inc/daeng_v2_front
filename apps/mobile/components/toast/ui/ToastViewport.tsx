import { useEffect, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  FadeOutUp,
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { useStore } from 'zustand';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { ToastItem } from '../model/store';
import type { StoreApi } from 'zustand';
import type { ToastPosition } from '@/types/toast';

type ToastState = {
  items: ToastItem[];
  dismiss: (id?: string) => void;
  clear: () => void;
};

const tokens = {
  radius: { rounded: 14, square: 0 } as const,
  padding: 12,
  gap: { rounded: 8, square: 0 },
  colors: { bg: '#41424a', fg: '#ffffff' },
  viewportOffset: {
    bottom: 0, // 화면 하단 여백
    bottomAboveNav: 60, // 네비게이션 바 위 (네비게이션 바 높이 + 여백)
  },
};

export function ToastViewport({ store, position }: { store: StoreApi<ToastState>; position: ToastPosition }) {
  const items = useStore(store, (s) => s.items);
  const dismiss = useStore(store, (s) => s.dismiss);
  const insets = useSafeAreaInsets();

  const topStyle =
    position === 'top'
      ? { top: insets.top + 12 }
      : position === 'bottom-above-nav'
        ? { bottom: insets.bottom + tokens.viewportOffset.bottomAboveNav }
        : { bottom: insets.bottom + tokens.viewportOffset.bottom };
  const isAllSquare = items.every((item) => item.shape === 'square');
  const horizontalMargin = isAllSquare ? 0 : 12;
  const gapValue = isAllSquare ? tokens.gap.square : tokens.gap.rounded;

  return (
    <View
      pointerEvents='box-none'
      style={{
        position: 'absolute',
        left: horizontalMargin,
        right: horizontalMargin,
        ...topStyle,
        gap: gapValue,
      }}
    >
      {items.map((it) => (
        <ToastRow key={it.id} item={it} onDismiss={() => dismiss(it.id)} />
      ))}
    </View>
  );
}

function ToastRow({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  // haptics (한 번만)
  const firedRef = useRef(false);
  useEffect(() => {
    if (!firedRef.current) {
      firedRef.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, []);

  // auto close
  useEffect(() => {
    const t = setTimeout(onDismiss, item.duration);
    return () => clearTimeout(t);
  }, [item.duration, onDismiss]);

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      opacity.value = withTiming(Math.max(0.4, 1 - Math.abs(e.translationX) / 180));
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > 80) {
        runOnJS(onDismiss)();
      } else {
        translateX.value = withTiming(0);
        opacity.value = withTiming(1);
      }
    });

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(16)}
      exiting={FadeOutUp.springify().damping(16)}
      style={{ width: '100%' }}
    >
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            animated,
            {
              backgroundColor: tokens.colors.bg,
              borderRadius: item.shape === 'rounded' ? tokens.radius.rounded : tokens.radius.square,
              padding: tokens.padding,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            },
          ]}
        >
          <Pressable onPress={onDismiss} accessibilityRole='alert'>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              {item.type === 'success' && <Ionicons name='checkmark-sharp' size={25} color={tokens.colors.fg} />}
              <View style={{ flex: 1 }}>
                {!!item.title && (
                  <Text style={{ color: tokens.colors.fg, fontWeight: '500', marginBottom: 4 }}>{item.title}</Text>
                )}
                {!!item.description && <Text style={{ color: tokens.colors.fg }}>{item.description}</Text>}
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
