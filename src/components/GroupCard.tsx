import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Config } from '../config';
import { images } from '../images';
import { EBusinessVertical } from '../types/common';
import { theme } from '../theme';

export type GroupCardProps = {
  title: string;
  subtitle: string;
  vehicleId?: number; // Optional for BANK vertical
  imgIndex?: number; // Optional for BANK vertical
  image?: string; // Optional for BANK vertical
  businessVertical?: EBusinessVertical; // Add this to determine image source
  onPress?: () => void;
};

const renderImage = (
  title: string,
  businessVertical?: EBusinessVertical,
  vehicleId?: number,
  imgIndex?: number,
) => {
  const key = title.toLowerCase().trim().replace(/\s+/g, '');

  if (key === 'all') return images['pan'];

  if (key === 'vehicle') {
    return images[`vehicle-${vehicleId}-${imgIndex}`];
  }

  // For BANK vertical, use vehicle_type images with vehicletype- prefix
  if (businessVertical === EBusinessVertical.BANK) {
    const vehicleTypeKey = `vehicletype-${key}`;
    if (images[vehicleTypeKey]) {
      return images[vehicleTypeKey];
    }
  }

  // For other verticals (Insurance, etc.), use case_option images (without prefix)
  // Fallback to original key for case_option, region, etc.
  return images[key] ?? null;
};

export default function GroupCard({
  title,
  subtitle,
  vehicleId,
  imgIndex,
  image,
  businessVertical,
  onPress,
}: GroupCardProps) {
  const { colors, dark } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{
        color: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: dark ? '#141414' : '#ffffff',
          borderColor: dark ? '#242424' : '#ececec',
          opacity: pressed && Platform.OS !== 'android' ? 0.96 : 1,
        },
      ]}
    >
      <Image
        source={renderImage(
          title,
          businessVertical,
          vehicleId || 0,
          imgIndex || 0,
        )}
        style={styles.image}
        resizeMode={
          businessVertical === EBusinessVertical.BANK ? 'contain' : 'cover'
        }
      />
      <View style={styles.texts}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text
          style={[styles.subtitle, { color: dark ? '#a3a3a3' : '#6b7280' }]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    // flex: 1,
    width: '31.33%',
    borderRadius: 16,
    borderWidth: 1,
    // padding: 10,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 96,
    // borderRadius: 12,
  },
  texts: {
    padding: theme.spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '800',
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
});
