import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

const Badge = ({ status }: { status: 'Winning' | 'Losing' }) => {
  const isWin = status === 'Winning';
  return (
    <View
      style={[
        styles.status,
        isWin ? { backgroundColor: theme.colors.successLight } : { backgroundColor: theme.colors.errorLight },
      ]}
    >
      <Text style={[styles.statusText, isWin ? { color: theme.colors.success } : { color: theme.colors.error }]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  status: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
  },
  statusText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
  },
});

export default Badge;
