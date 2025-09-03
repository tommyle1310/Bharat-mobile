import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export type LinkProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  textAlign?: 'left' | 'center' | 'right';
};

const Link: React.FC<LinkProps> = ({ 
  title, 
  onPress, 
  disabled = false, 
  style,
  textAlign = 'left'
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.container, style]}
    >
      <Text style={[
        styles.text,
        disabled && styles.textDisabled,
        { textAlign }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.xs,
  },
  text: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
    textDecorationLine: 'underline',
  },
  textDisabled: {
    color: theme.colors.textMuted,
    textDecorationLine: 'none',
  },
});

export default Link;
