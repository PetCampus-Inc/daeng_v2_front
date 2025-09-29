import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function BridgeDebugOverlay() {
  // 임시로 하드코딩된 데이터 (나중에 실제 브릿지 스토어로 교체)
  const logs: Array<{ t: number; dir: string; type: string; payload: any }> = [];

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Bridge Debug</Text>
      <Text style={styles.line}>Console messages will appear in React Native console</Text>
      <ScrollView style={{ maxHeight: 160, marginTop: 8 }}>
        {logs.length === 0 ? (
          <Text style={styles.log}>No logs yet</Text>
        ) : (
          logs.slice(-20).map((l, i) => (
            <Text key={i} style={styles.log}>
              {new Date(l.t).toLocaleTimeString()} [{l.dir}] {l.type} {JSON.stringify(l.payload)}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 8,
  },
  title: { color: 'white', fontWeight: 'bold', marginBottom: 6 },
  line: { color: 'white' },
  log: { color: '#ddd', fontSize: 12 },
});
