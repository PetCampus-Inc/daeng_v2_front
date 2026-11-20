import { Animated, BackHandler, Dimensions, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Portal } from '@gorhom/portal';
import Svg, { Circle, Path } from 'react-native-svg';
import { useBlockingOverlayStore } from '../model/blockingOverlayStore';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

// AOS 시스템 글자 크기 설정이 고정 lineHeight 레이아웃을 깨뜨리는 것을 방지 (QA3-198과 동일 정책, iOS 미적용)
const ALLOW_FONT_SCALING = Platform.OS !== 'android';
const MAX_FONT_SIZE_MULTIPLIER = Platform.OS === 'android' ? 1 : undefined;
const CONFIRM_DIALOG_MAX_HEIGHT = Dimensions.get('window').height * 0.85;

/** 공백 줄바꿈으로 2줄 → 아래 '취소'만 잘리는 AOS 버그 방지 */
function formatDialogButtonLabel(label: string) {
  return label.replace(/ /g, '\u00A0');
}

const confirmDialogButtonTextBase = {
  width: '100%' as const,
  textAlign: 'center' as const,
  ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
};

function RingLoadingSpinner() {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [rotation]);

  return (
    <AnimatedSvg
      width={40}
      height={40}
      viewBox='0 0 40 40'
      style={{ transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}
      accessibilityRole='progressbar'
      accessibilityLabel='로딩 중'
    >
      <Circle cx='20' cy='20' r='16' stroke='#E5E5EA' strokeWidth='4' strokeLinecap='round' fill='none' />
      <Path d='M4 20a16 16 0 0 1 32 0' stroke='#FF6E0C' strokeWidth='4' strokeLinecap='round' fill='none' />
    </AnimatedSvg>
  );
}

function BlockingOverlay() {
  const content = useBlockingOverlayStore((state) => state.content);
  const resolveConfirmDialog = useBlockingOverlayStore((state) => state.resolveConfirmDialog);
  const [shouldBreakConfirmTitle, setShouldBreakConfirmTitle] = useState(false);

  useEffect(() => {
    setShouldBreakConfirmTitle(false);
  }, [content]);

  useEffect(() => {
    if (!content || Platform.OS !== 'android') return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      const current = useBlockingOverlayStore.getState().content;
      if (!current) return false;

      if (current.kind === 'confirm') {
        useBlockingOverlayStore.getState().resolveConfirmDialog('cancel');
        return true;
      }

      return true;
    });

    return () => subscription.remove();
  }, [content]);

  if (!content) return null;

  const isVerticalLayout = content.kind === 'confirm' && content.buttonLayout === 'vertical';

  return (
    <Portal>
      <View style={styles.backdrop} accessibilityViewIsModal accessibilityRole='alert'>
        {content.kind === 'upload' ? (
          <View style={styles.uploadContent} accessibilityLabel={content.message}>
            <RingLoadingSpinner />
            <Text
              style={styles.uploadMessage}
              allowFontScaling={ALLOW_FONT_SCALING}
              maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
            >
              {content.message}
            </Text>
          </View>
        ) : (
          <View
            style={[styles.confirmDialogContent, { maxHeight: CONFIRM_DIALOG_MAX_HEIGHT }]}
            accessibilityLabel={content.title}
          >
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.confirmDialogHeader,
                content.contentPaddingHorizontal != null && { paddingHorizontal: content.contentPaddingHorizontal },
              ]}
            >
              <Text
                style={styles.confirmDialogTitle}
                allowFontScaling={ALLOW_FONT_SCALING}
                maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
                onTextLayout={(event) => {
                  if (
                    content.titleLineBreakAfterPartIndex != null &&
                    event.nativeEvent.lines.length > 1 &&
                    !shouldBreakConfirmTitle
                  ) {
                    setShouldBreakConfirmTitle(true);
                  }
                }}
              >
                {content.titleParts?.length
                  ? content.titleParts.map((part, index) => (
                      <Text
                        key={index}
                        style={part.accent ? styles.confirmDialogTitleAccent : undefined}
                        allowFontScaling={ALLOW_FONT_SCALING}
                        maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
                      >
                        {part.text}
                        {shouldBreakConfirmTitle && index === content.titleLineBreakAfterPartIndex ? '\n' : null}
                      </Text>
                    ))
                  : content.title}
              </Text>
              {content.description && (
                <Text
                  style={styles.confirmDialogDescription}
                  allowFontScaling={ALLOW_FONT_SCALING}
                  maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
                >
                  {content.description}
                </Text>
              )}
            </ScrollView>
            <View
              style={[
                styles.confirmDialogFooter,
                isVerticalLayout && styles.confirmDialogFooterVertical,
                content.contentPaddingHorizontal != null && { paddingHorizontal: content.contentPaddingHorizontal },
              ]}
            >
              {content.showCancelButton !== false && (
                <Pressable
                  style={[
                    styles.confirmDialogButton,
                    isVerticalLayout && styles.confirmDialogButtonVertical,
                    styles.confirmDialogCancelButton,
                  ]}
                  onPress={() => resolveConfirmDialog('cancel')}
                >
                  <Text
                    style={[styles.confirmDialogCancelButtonText, confirmDialogButtonTextBase]}
                    allowFontScaling={ALLOW_FONT_SCALING}
                    maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
                    numberOfLines={1}
                  >
                    {formatDialogButtonLabel(content.cancelLabel ?? '취소')}
                  </Text>
                </Pressable>
              )}
              <Pressable
                style={[
                  styles.confirmDialogButton,
                  isVerticalLayout && styles.confirmDialogButtonVertical,
                  content.confirmVariant === 'neutral'
                    ? styles.confirmDialogActionButtonNeutral
                    : styles.confirmDialogActionButton,
                ]}
                onPress={() => resolveConfirmDialog('confirm')}
              >
                <Text
                  style={[styles.confirmDialogActionButtonText, confirmDialogButtonTextBase]}
                  allowFontScaling={ALLOW_FONT_SCALING}
                  maxFontSizeMultiplier={MAX_FONT_SIZE_MULTIPLIER}
                  numberOfLines={1}
                >
                  {formatDialogButtonLabel(content.confirmLabel ?? '확인')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 20, 26, 0.7)',
    paddingHorizontal: 16,
  },
  uploadContent: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  uploadMessage: {
    color: '#1C1C1E',
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  confirmDialogContent: {
    width: '100%',
    maxWidth: 326,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  confirmDialogHeader: {
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  confirmDialogTitle: {
    color: '#15161B',
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: -0.4,
    lineHeight: 28,
    textAlign: 'left',
    paddingHorizontal: 4,
  },
  confirmDialogTitleAccent: {
    color: '#FF6E0C',
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  confirmDialogDescription: {
    color: '#70727C',
    fontWeight: '400',
    fontSize: 14,
    letterSpacing: -0.14,
    lineHeight: 20,
    textAlign: 'left',
    paddingHorizontal: 4,
  },
  confirmDialogFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  confirmDialogFooterVertical: {
    flexDirection: 'column',
  },
  confirmDialogButton: {
    flex: 1,
    minHeight: 56,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  confirmDialogButtonVertical: {
    flex: 0,
    alignSelf: 'stretch',
  },
  confirmDialogCancelButton: {
    borderWidth: 1,
    borderColor: '#B4B4BB',
    backgroundColor: '#FFFFFF',
  },
  confirmDialogActionButton: {
    backgroundColor: '#FF6E0C',
  },
  confirmDialogActionButtonNeutral: {
    backgroundColor: '#41424A',
  },
  confirmDialogCancelButtonText: {
    color: '#70727C',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.16,
    lineHeight: 24,
  },
  confirmDialogActionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.16,
    lineHeight: 24,
  },
});

export { BlockingOverlay };
