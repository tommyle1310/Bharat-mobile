import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export type CountdownProps = {
  endTime: string | Date | number | undefined | null;
  showLabels?: boolean; // show under-labels like Days/Hours/Minutes/Seconds
  showDays?: boolean; // include days column
};

function getTimeRemaining(endTime?: string | Date | number | null): number {
  if (!endTime) return 0;
  try {
    const end = new Date(endTime as any).getTime();
    return Math.max(0, Math.floor((end - Date.now()) / 1000));
  } catch {
    return 0;
  }
}

export default function Countdown({
  endTime,
  showLabels = false,
  showDays = true,
}: CountdownProps) {
  const [remaining, setRemaining] = useState<number>(() =>
    getTimeRemaining(endTime),
  );

  useEffect(() => {
    setRemaining(getTimeRemaining(endTime));
    const id = setInterval(() => setRemaining(getTimeRemaining(endTime)), 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const units = useMemo(() => {
    let s = remaining;
    const days = Math.floor(s / 86400);
    s -= days * 86400;
    const hours = Math.floor(s / 3600);
    s -= hours * 3600;
    const minutes = Math.floor(s / 60);
    s -= minutes * 60;
    const seconds = s;
    const pad = (n: number) => String(n).padStart(2, '0');
    if (showDays) {
      return [String(days), pad(hours), pad(minutes), pad(seconds)];
    }
    const totalHours = days * 24 + hours;
    return [String(totalHours), pad(minutes), pad(seconds)];
  }, [remaining, showDays]);

  const labels = showDays
    ? ['Days', 'Hours', 'Minutes', 'Seconds']
    : ['Hours', 'Minutes', 'Seconds'];

  return (
    <View style={styles.row}>
      {units.map((value, idx) => (
        <View key={idx} style={styles.item}>
          <View style={styles.box}>
            <Text style={[styles.value, { color: theme.colors.warning }]}>
              {value}
            </Text>
          </View>
          {showLabels ? (
            <Text style={[styles.label, { color: theme.colors.textMuted }]}>
              {labels[idx]}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  box: {
    width: '100%',
    // paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
    marginTop: theme.spacing.xs,
  },
});
