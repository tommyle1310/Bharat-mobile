import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

export type OTPInputProps = {
  length?: number;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  autoFocus?: boolean;
  editable?: boolean;
};

const OTPInput: React.FC<OTPInputProps> = ({
  length = 4,
  value = '',
  onChangeText,
  error,
  autoFocus = false,
  editable = true,
}) => {
  const inputRefs = useRef<TextInput[]>([]);
  const [otp, setOtp] = useState<string[]>(value.split('').slice(0, length));

  useEffect(() => {
    setOtp(value.split('').slice(0, length));
  }, [value, length]);

  const handleChangeText = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Move to previous input if current input is empty and backspace is pressed
    if (!text && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    onChangeText?.(newOtp.join(''));
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.otpContainer}>
        {Array.from({ length }, (_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) inputRefs.current[index] = ref;
            }}
            style={[
              styles.otpInput,
              error ? styles.otpInputError : undefined,
              !editable ? styles.otpInputDisabled : undefined,
            ]}
            value={otp[index] || ''}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={1}
            autoFocus={autoFocus && index === 0}
            editable={editable}
            selectTextOnFocus
            textAlign="center"
          />
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    fontSize: theme.fontSizes.xl,
    fontWeight: '600',
    color: theme.colors.text,
    backgroundColor: theme.colors.card,
    textAlign: 'center',
    fontFamily: theme.fonts.semibold,
  },
  otpInputError: {
    borderColor: theme.colors.error,
  },
  otpInputDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
    color: theme.colors.textMuted,
  },
  errorText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },
});

export default OTPInput;
