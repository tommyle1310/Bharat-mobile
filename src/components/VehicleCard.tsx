import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Badge from './Badge';
import Button from './Button';
import { theme } from '../theme';

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
  const navigation = useNavigation<any>();

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
    const days = Math.floor(s / 86400);
    s -= days * 86400;
    const hours = Math.floor(s / 3600);
    s -= hours * 3600;
    const minutes = Math.floor(s / 60);
    s -= minutes * 60;
    const seconds = s;
    const pad = (n: number) => String(n).padStart(2, '0');
    return [days, pad(hours), pad(minutes), pad(seconds)] as [
      number,
      string,
      string,
      string,
    ];
  }, [remaining]);

  const goDetail = () =>
    navigation.navigate('VehicleDetail', { vehicle: props });

  return (
    <Pressable
      onPress={goDetail}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.countdownRow} pointerEvents="none">
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
                  backgroundColor: theme.colors.backgroundSecondary,
                  borderColor: theme.colors.borderLight,
                },
              ]}
            >
              <Text style={[styles.countText, { color: theme.colors.warning }]}>
                {i.v}
              </Text>
            </View>
            <Text
              style={[
                styles.countUnderLabel,
                { color: theme.colors.textMuted },
              ]}
            >
              {i.l}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.mediaRow}>
        <Image source={{ uri: props.image }} style={styles.media} />
        <View style={[styles.meta, { borderColor: theme.colors.border }]}>
          <Text style={styles.metaAccent}>{props.kms}</Text>
          <Text style={styles.metaAccent}>{props.fuel}</Text>
          <Text style={styles.metaAccent}>{props.owner}</Text>
          <Text style={[styles.metaLine, { color: theme.colors.textMuted }]}>
            {props.region}
          </Text>
        </View>
      </View>

      <View style={styles.titleRow}>
        <MaterialIcons
          name={props.isFavorite ? 'star' : 'star-outline'}
          size={18}
          color={props.isFavorite ? theme.colors.error : theme.colors.textMuted}
          style={styles.starIcon}
        />
        <Text
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {props.title}
        </Text>
      </View>

      <View style={styles.actionRow}>
        <Badge status={props.status} />
        <Button icon='dollar' variant='secondary' title="Bid" onPress={props.onPressBid} />
      </View>

      <Text style={[styles.contact, { color: theme.colors.text }]}>
        {props.manager_name} -{' '}
        <Text style={styles.phone}>{props.manager_phone}</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  bidIcon: {
    marginRight: theme.spacing.xs,
  },
  bidText: {
    color: theme.colors.textInverse,
    fontWeight: '700',
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.bold,
  },
  countItem: {
    alignItems: 'center',
    flex: 1,
  },
  countBox: {
    width: '100%',
    paddingVertical: theme.spacing.sm,

    borderRadius: theme.radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
  },
  countUnderLabel: {
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing.sm,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
  },
  mediaRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  media: {
    width: 220,
    height: 120,
    borderRadius: theme.radii.md,
  },
  meta: {
    flex: 1,
    borderLeftWidth: 1,
    paddingLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  metaLine: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
  },
  metaAccent: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    lineHeight: 22,
    fontFamily: theme.fonts.bold,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  starIcon: {
    marginTop: 1,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  contact: {
    fontSize: theme.fontSizes.md,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
  },
  phone: {
    color: theme.colors.primary,
  },
});
