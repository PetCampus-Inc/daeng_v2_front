import { useBridgeStore } from '@/stores/bridgeStore';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function BridgeDebugOverlay() {
  const { lastReceivedType, payload, logs } = useBridgeStore();

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Bridge Debug</Text>
      <Text style={styles.line}>Last: {String(lastReceivedType ?? '-')}</Text>
      <Text style={styles.line}>Payload: {JSON.stringify(payload)}</Text>
      <ScrollView style={{ maxHeight: 160, marginTop: 8 }}>
        {logs.slice(-20).map((l, i) => (
          <Text key={i} style={styles.log}>
            {new Date(l.t).toLocaleTimeString()} [{l.dir}] {l.type} {JSON.stringify(l.payload)}
          </Text>
        ))}
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
