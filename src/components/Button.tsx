import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  disabled?: boolean;
  style?: any;
};

const Button: React.FC<ButtonProps> = ({ title, onPress, variant = 'primary', disabled, style }) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        disabled ? styles.disabled : undefined,
        pressed && Platform.OS !== 'android' ? styles.pressed : undefined,
        style,
      ]}
    >
      <Text style={[styles.label, labelStyles[variant], disabled ? styles.labelDisabled : undefined]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.6 },
  label: { fontWeight: '800', fontSize: 16 },
  labelDisabled: { opacity: 0.8 },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: '#111827', borderColor: '#111827' },
  secondary: { backgroundColor: '#f59e0b', borderColor: '#f59e0b' },
  destructive: { backgroundColor: '#ef4444', borderColor: '#ef4444' },
  outline: { backgroundColor: 'transparent', borderColor: '#e5e7eb' },
});

const labelStyles = StyleSheet.create({
  primary: { color: '#ffffff' },
  secondary: { color: '#ffffff' },
  destructive: { color: '#ffffff' },
  outline: { color: '#111827' },
});

export default Button;


