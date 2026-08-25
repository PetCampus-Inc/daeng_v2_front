import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { Portal } from '@gorhom/portal';
import Svg, { Circle, Path } from 'react-native-svg';
import { useBlockingOverlayStore } from '../model/blockingOverlayStore';

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

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
  const resolveAddressRegistrationDialog = useBlockingOverlayStore((state) => state.resolveAddressRegistrationDialog);

  if (!content) return null;

  return (
    <Portal>
      <View style={styles.backdrop} accessibilityViewIsModal accessibilityRole='alert'>
        {content.kind === 'upload' ? (
          <View style={styles.uploadContent} accessibilityLabel={content.message}>
            <RingLoadingSpinner />
            <Text style={styles.uploadMessage}>{content.message}</Text>
          </View>
        ) : (
          <View style={styles.addressDialogContent} accessibilityLabel='등록된 장소가 없어요'>
            <View style={styles.addressDialogHeader}>
              <Text style={styles.addressDialogTitle}>등록된 장소가 없어요</Text>
              <Text style={styles.addressDialogDescription}>장소를 등록하면{`\n`}가까운 유치원을 찾을 수 있어요.</Text>
            </View>
            <View style={styles.addressDialogFooter}>
              <Pressable
                style={[styles.addressDialogButton, styles.addressDialogCancelButton]}
                onPress={() => resolveAddressRegistrationDialog('cancel')}
              >
                <Text style={styles.addressDialogCancelButtonText}>나중에 하기</Text>
              </Pressable>
              <Pressable
                style={[styles.addressDialogButton, styles.addressDialogActionButton]}
                onPress={() => resolveAddressRegistrationDialog('register')}
              >
                <Text style={styles.addressDialogActionButtonText}>등록하기</Text>
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
    paddingHorizontal: 40,
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
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'center',
  },
  addressDialogContent: {
    width: '100%',
    maxWidth: 334,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  addressDialogHeader: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  addressDialogTitle: {
    color: '#15161B',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  addressDialogDescription: {
    color: '#70727C',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: -0.16,
    lineHeight: 24,
    textAlign: 'center',
  },
  addressDialogFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  addressDialogButton: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  addressDialogCancelButton: {
    borderWidth: 1,
    borderColor: '#B4B4BB',
    backgroundColor: '#FFFFFF',
  },
  addressDialogActionButton: {
    backgroundColor: '#FF6E0C',
  },
  addressDialogCancelButtonText: {
    color: '#70727C',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.16,
    lineHeight: 24,
  },
  addressDialogActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.16,
    lineHeight: 24,
  },
});

export { BlockingOverlay };
