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

export type GroupCardProps = {
  title: string;
  subtitle: string;
  vehicleId: number;
  imgIndex: number;
  image: string;
  onPress?: () => void;
};

const renderImage = (title: string, vehicleId?: number, imgIndex?: number) => {
  const key = title.toLowerCase().trim().replace(/\s+/g, "");
  if (key === 'all') return images['pan']
  else if (key === 'vehicle') {
    return images[`vehicle-${vehicleId}-${imgIndex}`]
  }
  return images[key] ?? null;
};


export default function GroupCard({
  title,
  subtitle,
  vehicleId,
  imgIndex,
  image,
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
      <Image source={renderImage(title, vehicleId, imgIndex)} style={styles.image} resizeMode="cover" />
        <View style={styles.texts}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
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
    padding: 10,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 94,
    borderRadius: 12,
  },
  texts: {
    paddingTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
});
