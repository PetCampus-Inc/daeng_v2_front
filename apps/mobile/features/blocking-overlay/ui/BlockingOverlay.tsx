import { Animated, Easing, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Portal } from '@gorhom/portal';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { useBlockingOverlayStore } from '../model/blockingOverlayStore';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

// AOS 시스템 글자 크기 설정이 고정 lineHeight 레이아웃을 깨뜨리는 것을 방지 (QA3-198과 동일 정책, iOS 미적용)
const ALLOW_FONT_SCALING = Platform.OS !== 'android';

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

/** 웹 packages/icons의 Paw 아이콘과 동일한 path (프로필 이미지 없을 때 아바타 fallback용) */
function PawIcon({ size = 20, color = '#DEDEE3' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
      <Ellipse
        cx='2.30077'
        cy='3.06816'
        rx='2.30077'
        ry='3.06816'
        transform='matrix(0.996198 -0.0871178 0.0871937 0.996191 6.59668 3.40088)'
        fill={color}
      />
      <Ellipse
        cx='2.30074'
        cy='3.06821'
        rx='2.30074'
        ry='3.06821'
        transform='matrix(0.978166 -0.207824 0.207999 0.978129 2 8.11441)'
        fill={color}
      />
      <Ellipse
        cx='2.30074'
        cy='3.06821'
        rx='2.30074'
        ry='3.06821'
        transform='matrix(-0.978166 -0.207824 -0.207999 0.978129 22 8.11441)'
        fill={color}
      />
      <Path
        d='M15.3744 11.4579C14.6474 10.489 13.8396 9.84311 11.6587 9.84311C9.51806 9.96422 8.62958 11.4579 7.98337 12.7498C7.33716 14.0416 6.48904 14.2839 5.64083 15.5353C4.97923 16.5115 4.99462 18.3209 5.64083 19.209C6.28704 20.0972 7.37752 20.2587 8.50838 20.2587C9.63925 20.2587 10.6893 19.6127 11.9414 19.6127C13.1934 19.6127 13.88 20.0568 15.0109 20.2587C16.1417 20.4605 17.4745 20.299 18.4035 19.209C19.3324 18.119 19.0093 15.6161 17.6361 14.6068C16.2629 13.5976 16.1013 12.4268 15.3744 11.4579Z'
        fill={color}
      />
      <Ellipse
        cx='2.30077'
        cy='3.06816'
        rx='2.30077'
        ry='3.06816'
        transform='matrix(-0.996198 -0.0871178 -0.0871937 0.996191 17.4648 3.40088)'
        fill={color}
      />
    </Svg>
  );
}

function BlockingOverlay() {
  const content = useBlockingOverlayStore((state) => state.content);
  const resolveConfirmDialog = useBlockingOverlayStore((state) => state.resolveConfirmDialog);
  const [shouldBreakConfirmTitle, setShouldBreakConfirmTitle] = useState(false);

  useEffect(() => {
    setShouldBreakConfirmTitle(false);
  }, [content]);

  if (!content) return null;

  return (
    <Portal>
      <View style={styles.backdrop} accessibilityViewIsModal accessibilityRole='alert'>
        {content.kind === 'upload' ? (
          <View style={styles.uploadContent} accessibilityLabel={content.message}>
            <RingLoadingSpinner />
            <Text style={styles.uploadMessage} allowFontScaling={ALLOW_FONT_SCALING}>
              {content.message}
            </Text>
          </View>
        ) : (
          <View style={styles.confirmDialogContent} accessibilityLabel={content.title}>
            <View
              style={[
                styles.confirmDialogHeader,
                content.contentPaddingHorizontal != null && { paddingHorizontal: content.contentPaddingHorizontal },
              ]}
            >
              {content.showAvatar && (
                <View style={styles.confirmDialogAvatar}>
                  {content.avatarUrl ? (
                    <Image source={{ uri: content.avatarUrl }} style={styles.confirmDialogAvatarImage} />
                  ) : (
                    <PawIcon />
                  )}
                </View>
              )}
              <Text
                style={styles.confirmDialogTitle}
                allowFontScaling={ALLOW_FONT_SCALING}
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
                      <Text key={index} style={part.accent ? styles.confirmDialogTitleAccent : undefined}>
                        {part.text}
                        {shouldBreakConfirmTitle && index === content.titleLineBreakAfterPartIndex ? '\n' : null}
                      </Text>
                    ))
                  : content.title}
              </Text>
              {content.description && (
                <Text style={styles.confirmDialogDescription} allowFontScaling={ALLOW_FONT_SCALING}>
                  {content.description}
                </Text>
              )}
            </View>
            <View
              style={[
                styles.confirmDialogFooter,
                content.contentPaddingHorizontal != null && { paddingHorizontal: content.contentPaddingHorizontal },
              ]}
            >
              {content.showCancelButton !== false && (
                <Pressable
                  style={[styles.confirmDialogButton, styles.confirmDialogCancelButton]}
                  onPress={() => resolveConfirmDialog('cancel')}
                >
                  <Text style={styles.confirmDialogCancelButtonText} allowFontScaling={ALLOW_FONT_SCALING}>
                    {content.cancelLabel ?? '취소'}
                  </Text>
                </Pressable>
              )}
              <Pressable
                style={[
                  styles.confirmDialogButton,
                  content.confirmVariant === 'neutral'
                    ? styles.confirmDialogActionButtonNeutral
                    : styles.confirmDialogActionButton,
                ]}
                onPress={() => resolveConfirmDialog('confirm')}
              >
                <Text style={styles.confirmDialogActionButtonText} allowFontScaling={ALLOW_FONT_SCALING}>
                  {content.confirmLabel ?? '확인'}
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
    fontFamily: 'SUIT-Bold',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  confirmDialogContent: {
    width: '100%',
    maxWidth: 358,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  confirmDialogHeader: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  confirmDialogAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F9F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 16, // + header의 gap(8) = 아바타-제목 사이 24px
  },
  confirmDialogAvatarImage: {
    width: 52,
    height: 52,
  },
  confirmDialogTitle: {
    color: '#15161B',
    fontFamily: 'SUIT-ExtraBold',
    fontSize: 20,
    letterSpacing: -0.4,
    lineHeight: 28,
    textAlign: 'center',
  },
  confirmDialogTitleAccent: {
    color: '#FF6E0C',
  },
  confirmDialogDescription: {
    color: '#70727C',
    fontFamily: 'SUIT-Regular',
    fontSize: 16,
    letterSpacing: -0.16,
    lineHeight: 24,
    textAlign: 'center',
  },
  confirmDialogFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  confirmDialogButton: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
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
    fontFamily: 'SUIT-Bold',
    fontSize: 16,
    letterSpacing: -0.16,
    lineHeight: 24,
  },
  confirmDialogActionButtonText: {
    color: '#FFFFFF',
    fontFamily: 'SUIT-Bold',
    fontSize: 16,
    letterSpacing: -0.16,
    lineHeight: 24,
  },
});

export { BlockingOverlay };
