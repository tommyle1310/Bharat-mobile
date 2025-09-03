import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme';

export type NumericKeypadProps = {
  onNumberPress: (number: string) => void;
  onDeletePress: () => void;
  onConfirmPress: () => void;
  otpValue: string;
  maxLength?: number;
};

const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onNumberPress,
  onDeletePress,
  onConfirmPress,
  otpValue,
  maxLength = 4,
}) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['⌫', '0', '✓']
  ];

  const handleKeyPress = (key: string) => {
    if (key === '⌫') {
      onDeletePress();
    } else if (key === '✓') {
      onConfirmPress();
    } else {
      onNumberPress(key);
    }
  };

  const isConfirmDisabled = otpValue.length !== maxLength;

  return (
    <View style={styles.container}>
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((key, keyIndex) => (
              <TouchableOpacity
                key={keyIndex}
                style={[
                  styles.key,
                  key === '⌫' && styles.deleteKey,
                  key === '✓' && [
                    styles.confirmKey,
                    isConfirmDisabled && styles.confirmKeyDisabled,
                  ],
                ]}
                onPress={() => handleKeyPress(key)}
                disabled={key === '✓' && isConfirmDisabled}
              >
                <Text style={[
                  styles.keyText,
                  key === '⌫' && styles.deleteText,
                  key === '✓' && [
                    styles.confirmText,
                    isConfirmDisabled && styles.confirmTextDisabled,
                  ],
                ]}>
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  keypad: {
    width: '100%',
    maxWidth: 280,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  key: {
    width: 80,
    height: 80,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  keyText: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.semibold,
  },
  deleteKey: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  deleteText: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.medium,
  },
  confirmKey: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  confirmKeyDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.border,
  },
  confirmText: {
    fontSize: theme.fontSizes.xl,
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.medium,
  },
  confirmTextDisabled: {
    color: theme.colors.textMuted,
  },
});

export default NumericKeypad;
