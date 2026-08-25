import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
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

  if (!content) return null;

  return (
    <Portal>
      <View style={styles.backdrop} accessibilityViewIsModal accessibilityRole='alert'>
        <View style={styles.uploadContent} accessibilityLabel={content.message}>
          <RingLoadingSpinner />
          <Text style={styles.uploadMessage}>{content.message}</Text>
        </View>
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
});

export { BlockingOverlay };
