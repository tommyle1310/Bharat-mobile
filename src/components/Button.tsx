import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { theme } from '../theme';

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
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.6 },
  label: { 
    fontWeight: '600', 
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.medium,
  },
  labelDisabled: { opacity: 0.8 },
});

const variantStyles = StyleSheet.create({
  primary: { 
    backgroundColor: theme.colors.buttonPrimary, 
    borderColor: theme.colors.buttonPrimary,
    borderWidth: 1,
  },
  secondary: { 
    backgroundColor: theme.colors.buttonSecondary, 
    borderColor: theme.colors.buttonSecondary,
    borderWidth: 1,
  },
  destructive: { 
    backgroundColor: theme.colors.buttonDestructive, 
    borderColor: theme.colors.buttonDestructive,
    borderWidth: 1,
  },
  outline: { 
    backgroundColor: 'transparent', 
    borderColor: theme.colors.buttonOutline,
    borderWidth: 1,
  },
});

const labelStyles = StyleSheet.create({
  primary: { color: theme.colors.textInverse },
  secondary: { color: theme.colors.textInverse },
  destructive: { color: theme.colors.textInverse },
  outline: { color: theme.colors.text },
});

export default Button;


