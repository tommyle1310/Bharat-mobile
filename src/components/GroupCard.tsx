import React from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

export type GroupCardProps = {
  title: string;
  subtitle: string;
  image: string;
  onPress?: () => void;
};

export default function GroupCard({ title, subtitle, image, onPress }: GroupCardProps) {
  const { colors, dark } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: dark ? '#141414' : '#ffffff',
          borderColor: dark ? '#242424' : '#ececec',
          opacity: pressed && Platform.OS !== 'android' ? 0.9 : 1,
        },
      ]}
    >
      <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: dark ? '#a3a3a3' : '#6b7280' }]} numberOfLines={1}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 84,
    borderRadius: 10,
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
  },
});


