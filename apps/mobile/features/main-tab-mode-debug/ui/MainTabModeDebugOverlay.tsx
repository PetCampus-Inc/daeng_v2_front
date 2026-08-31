import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Portal } from '@gorhom/portal';
import { useMainTabModeDebugLogStore } from '../model/mainTabModeDebugLogStore';

// TEMP DEBUG: 원장/보호자 하단 탭 깜빡임 원인 파악용. 확인 끝나면 폴더째 제거.
// App.tsx에서 마운트한다. 실기기에서만 켜고 배포 전 반드시 제거할 것.

function MainTabModeDebugOverlay() {
  const lines = useMainTabModeDebugLogStore((state) => state.lines);

  if (lines.length === 0) return null;

  return (
    <Portal>
      <View style={styles.container} pointerEvents='none'>
        <ScrollView pointerEvents='none'>
          {lines.map((line, index) => (
            <Text key={index} style={styles.line}>
              {line}
            </Text>
          ))}
        </ScrollView>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 60,
    maxHeight: '35%',
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  line: {
    color: '#0f0',
    fontSize: 9,
    lineHeight: 12,
  },
});

export { MainTabModeDebugOverlay };
