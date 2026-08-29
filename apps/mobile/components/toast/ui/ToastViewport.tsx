import { useCallback, useEffect, useRef } from 'react';
import { InteractionManager, View, Text, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { useStore } from 'zustand';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import type { ToastItem } from '../model/store';
import type { StoreApi } from 'zustand';
import type { ToastPosition } from '@knockdog/bridge-core';
import { getBottomTabBarHeight } from '@/components/navigation/bottomTabBarHeight';
import { useBottomTabBarVisibilityStore } from '@/bridges/model/bottomTabBarVisibilityStore';

type ToastState = {
  items: ToastItem[];
  dismiss: (id?: string) => void;
  clear: () => void;
};

const tokens = {
  radius: { rounded: 4, square: 0 } as const,
  padding: 12,
  gap: { rounded: 8, square: 0 },
  colors: { bg: '#41424a', fg: '#ffffff', accent: '#ff6e0c' },
  viewportOffset: {
    bottom: 0, // 화면 하단 여백 (바텀탭 없을 때)
    aboveBottomTabBar: 16, // 바텀탭 위 여백
    bottomAboveNav: 55, // 네비게이션 바 위 (네비게이션 바 높이 + 여백)
  },
};

const toastTextStyle = {
  fontFamily: 'SUIT-Medium',
  fontSize: 16,
  lineHeight: 24,
  letterSpacing: -0.16,
};

// AOS 시스템 글자 크기 설정이 고정 lineHeight 레이아웃을 깨뜨리는 것을 방지 (QA3-198과 동일 정책, iOS 미적용)
const ALLOW_FONT_SCALING = Platform.OS !== 'android';

export function ToastViewport({ store, position }: { store: StoreApi<ToastState>; position: ToastPosition }) {
  const items = useStore(store, (s) => s.items);
  const dismiss = useStore(store, (s) => s.dismiss);
  const insets = useSafeAreaInsets();
  const isBottomTabBarVisible = useBottomTabBarVisibilityStore((s) => s.visible);

  const handleDismiss = useCallback(
    (id: string) => {
      dismiss(id);
    },
    [dismiss]
  );

  const bottomOffset = isBottomTabBarVisible
    ? getBottomTabBarHeight(insets.bottom) + tokens.viewportOffset.aboveBottomTabBar
    : insets.bottom + tokens.viewportOffset.bottom;

  const topStyle =
    position === 'top'
      ? { top: insets.top + 12 }
      : position === 'bottom-above-nav'
        ? { bottom: insets.bottom + tokens.viewportOffset.bottomAboveNav }
        : { bottom: bottomOffset };
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
        <ToastRow key={it.id} item={it} itemId={it.id} onDismiss={handleDismiss} />
      ))}
    </View>
  );
}

function ToastRow({ item, itemId, onDismiss }: { item: ToastItem; itemId: string; onDismiss: (id: string) => void }) {
  const isDismissingRef = useRef(false);
  const isDismissing = useSharedValue(false);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-8);

  const dismissWithAnimation = useCallback(() => {
    if (isDismissingRef.current) return;
    isDismissingRef.current = true;
    isDismissing.value = true;

    opacity.value = withTiming(0, { duration: 150 }, (finished) => {
      if (finished) {
        runOnJS(onDismiss)(itemId);
      }
    });
    translateY.value = withTiming(-8, { duration: 150 });
  }, [isDismissing, itemId, onDismiss, opacity, translateY]);

  // haptics (한 번만)
  const firedRef = useRef(false);
  useEffect(() => {
    if (!firedRef.current) {
      firedRef.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, []);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 200 });
    translateY.value = withTiming(0, { duration: 200 });
  }, [opacity, translateY]);

  // auto close
  useEffect(() => {
    const t = setTimeout(() => dismissWithAnimation(), item.duration);
    return () => clearTimeout(t);
  }, [dismissWithAnimation, item.duration]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (isDismissing.value) return;
      translateX.value = e.translationX;
      opacity.value = withTiming(Math.max(0.4, 1 - Math.abs(e.translationX) / 180));
    })
    .onEnd((e) => {
      if (isDismissing.value) return;
      if (Math.abs(e.translationX) > 80) {
        runOnJS(dismissWithAnimation)();
      } else {
        translateX.value = withTiming(0);
        opacity.value = withTiming(1);
      }
    });

  const animated = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={{
        width: '100%',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            animated,
            {
              backgroundColor: tokens.colors.bg,
              borderRadius: item.shape === 'rounded' ? tokens.radius.rounded : tokens.radius.square,
              padding: tokens.padding,
            },
          ]}
        >
          <Pressable onPress={dismissWithAnimation} accessibilityRole='alert'>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              {item.type === 'success' && <Ionicons name='checkmark-sharp' size={25} color={tokens.colors.fg} />}
              {item.icon === 'info' && (
                <Ionicons
                  name='information-circle-outline'
                  size={20}
                  color={item.iconAccent ? tokens.colors.accent : tokens.colors.fg}
                />
              )}
              <View style={{ flex: 1 }}>
                {(!!item.titleParts?.length || !!item.title) && (
                  <Text
                    allowFontScaling={ALLOW_FONT_SCALING}
                    style={[toastTextStyle, { color: tokens.colors.fg, marginBottom: item.description ? 4 : 0 }]}
                  >
                    {item.titleParts?.length
                      ? item.titleParts.map((part, index) => (
                          <Text
                            key={`${part.text}-${index}`}
                            allowFontScaling={ALLOW_FONT_SCALING}
                            style={[
                              toastTextStyle,
                              part.accent
                                ? { color: tokens.colors.accent, fontFamily: 'SUIT-Bold' }
                                : { color: tokens.colors.fg },
                            ]}
                          >
                            {part.text}
                          </Text>
                        ))
                      : item.title}
                  </Text>
                )}
                {!!item.description && (
                  <Text allowFontScaling={ALLOW_FONT_SCALING} style={[toastTextStyle, { color: tokens.colors.fg }]}>
                    {item.description}
                  </Text>
                )}
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
