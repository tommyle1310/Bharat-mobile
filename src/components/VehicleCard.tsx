import React, { useEffect, useMemo, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export type VehicleCardProps = {
  image: string;
  title: string;
  kms: string;
  fuel: string;
  owner: string;
  region: string;
  status: 'Winning' | 'Losing';
  onPressBid?: () => void;
  isFavorite?: boolean;
  endTime?: string; // ISO string for countdown
  manager_name: string;
  manager_phone: string;
};

export default function VehicleCard(props: VehicleCardProps) {
  const { colors, dark } = useTheme();
  const isDark = dark;

  const [remaining, setRemaining] = useState<number>(() => {
    const end = props.endTime ? new Date(props.endTime).getTime() : Date.now();
    return Math.max(0, Math.floor((end - Date.now()) / 1000));
  });

  useEffect(() => {
    if (!props.endTime) return;
    const interval = setInterval(() => {
      const end = new Date(props.endTime as string).getTime();
      const secs = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setRemaining(secs);
    }, 1000);
    return () => clearInterval(interval);
  }, [props.endTime]);

  const ddhhmmss = useMemo(() => {
    let s = remaining;
    const days = Math.floor(s / 86400); s -= days * 86400;
    const hours = Math.floor(s / 3600); s -= hours * 3600;
    const minutes = Math.floor(s / 60); s -= minutes * 60;
    const seconds = s;
    const pad = (n: number) => String(n).padStart(2, '0');
    return [days, pad(hours), pad(minutes), pad(seconds)] as [number, string, string, string];
  }, [remaining]);

  return (
    <View style={[styles.card, { backgroundColor: isDark ? '#0f0f0f' : '#fff', borderColor: isDark ? '#222' : '#ececec' }]}> 
      <View style={styles.countdownRow}>
        {[
          { v: String(ddhhmmss[0]), l: 'Days' },
          { v: ddhhmmss[1], l: 'Hours' },
          { v: ddhhmmss[2], l: 'Minutes' },
          { v: ddhhmmss[3], l: 'Seconds' },
        ].map((i, idx) => (
          <View key={idx} style={styles.countItem}>
            <View
              style={[
                styles.countBox,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#eef2f6',
                  borderColor: isDark ? '#2a2a2a' : '#e3e8ef',
                },
              ]}
            >
              <Text style={[styles.countText, { color: isDark ? '#fff' : '#111827' }]}>{i.v}</Text>
            </View>
            <Text style={[styles.countUnderLabel, { color: isDark ? '#a3a3a3' : '#6b7280' }]}>{i.l}</Text>
          </View>
        ))}
      </View>

      <View style={styles.mediaRow}>
        <Image source={{ uri: props.image }} style={styles.media} />
        <View style={[styles.meta, { borderColor: isDark ? '#262626' : '#e5e7eb' }]}> 
          <Text style={[styles.metaLine, { color: colors.text }]}>{props.kms}</Text>
          <Text style={[styles.metaLine, { color: colors.text }]}>{props.fuel}</Text>
          <Text style={[styles.metaLine, { color: colors.text }]}>{props.owner}</Text>
          <Text style={[styles.metaLine, { color: colors.text }]}>{props.region}</Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <MaterialIcons
          name={props.isFavorite ? 'star' : 'star-outline'}
          size={18}
          color={props.isFavorite ? '#ef4444' : (isDark ? '#3f3f46' : '#d1d5db')}
          style={styles.starIcon}
        />
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{props.title}</Text>
      </View>

      <View style={styles.actionRow}>
        <View
          style={[
            styles.status,
            props.status === 'Winning'
              ? { backgroundColor: 'rgba(22,163,74,0.15)' }
              : { backgroundColor: 'rgba(239,68,68,0.15)' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              props.status === 'Winning' ? { color: '#16a34a' } : { color: '#ef4444' },
            ]}
          >
            {props.status}
          </Text>
        </View>
        <Pressable
          onPress={props.onPressBid}
          android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
          style={({ pressed }) => [styles.bidBtn, { opacity: pressed && Platform.OS !== 'android' ? 0.9 : 1 }]}
        >
          <Text style={styles.bidText}>Bid</Text>
        </Pressable>
      </View>

      <Text style={[styles.contact, { color: colors.text }]}>{props.manager_name} - <Text style={styles.phone}>{props.manager_phone}</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12
  },
  countItem: {
    alignItems: 'center',
    flex: 1,
  },
  countBox: {
    width: '100%',
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 22,
    fontWeight: '700',
  },
  countLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  countUnderLabel: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  mediaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  media: {
    width: 220,
    height: 120,
    borderRadius: 12,
  },
  meta: {
    flex: 1,
    borderLeftWidth: 1,
    paddingLeft: 12,
    justifyContent: 'space-between',
  },
  metaLine: {
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  starIcon: {
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
  },
  bidBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bidText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  contact: {
    fontSize: 15,
    margin: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 4,
    fontWeight: '600',
  },
  phone: {
    color: '#2563eb',
  },
});


