import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Badge = ({ status }: { status: 'Winning' | 'Losing' }) => {
  const isWin = status === 'Winning';
  return (
    <View
      style={[
        styles.status,
        isWin ? { backgroundColor: 'rgba(22,163,74,0.15)' } : { backgroundColor: 'rgba(239,68,68,0.15)' },
      ]}
    >
      <Text style={[styles.statusText, isWin ? { color: '#16a34a' } : { color: '#ef4444' }]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  status: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default Badge;
