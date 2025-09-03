import React from 'react';
import { TextInput, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export type InputProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  label?: string;
  style?: any;
  editable?: boolean;
  maxLength?: number;
};

const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  label,
  style,
  editable = true,
  maxLength,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : undefined,
          !editable ? styles.inputDisabled : undefined,
          style,
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        maxLength={maxLength}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.medium,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
    fontFamily: theme.fonts.regular,
    ...theme.shadows.sm,
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
    color: theme.colors.textMuted,
  },
  errorText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
});

export default Input;
