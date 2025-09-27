import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

const Badge = ({ status }: { status: 'Winning' | 'Losing' }) => {
  const isWin = status === 'Winning';
  return (
    <View
      style={[
        styles.status,
        isWin ? { backgroundColor: theme.colors.primary } : { backgroundColor: theme.colors.error },
      ]}
    >
      <View style={styles.statusContent}>
        <View style={[styles.statusIndicator, { backgroundColor: isWin ? '#bcebbe' : '#f28385' }]} />
        <Text style={styles.statusText}>
          {status}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  status: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderRadius: 0,
    borderTopLeftRadius: theme.radii.lg,
    borderBottomRightRadius: theme.radii.lg,
    minWidth: 100,
    // height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.pill,
  },
  statusText: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
    color: theme.colors.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default Badge;
