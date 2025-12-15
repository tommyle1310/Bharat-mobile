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
    // Handle IST timestamp (naive timestamp without timezone info)
    if (typeof endTime === 'string') {
      const s = String(endTime).replace('T', ' ').replace('Z', '').trim();
      const m = s.match(
        /^(\d{4})[-\/]?(\d{2}|\d{1})[-\/]?(\d{2}|\d{1})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/,
      );
      if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        const hh = Number(m[4]);
        const mm = Number(m[5]);
        const ss = m[6] ? Number(m[6]) : 0;
        // Convert IST (UTC+05:30) naive timestamp to UTC epoch
        const endMs = Date.UTC(y, mo, d, hh - 5, mm - 30, ss);
        return Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      }
    }
    // Fallback to standard Date parsing
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
    width: '100%',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  box: {
    width: '100%',
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
  },
  label: {
    fontSize: theme.fontSizes.xs,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
    marginTop: theme.spacing.xs,
  },
});
