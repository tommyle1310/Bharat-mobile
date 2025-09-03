import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { theme } from '../theme';

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onValueChange?: (value: string) => void;
  error?: string;
  style?: any;
  disabled?: boolean;
};

const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onValueChange,
  error,
  style,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    options.find(option => option.value === value) || null
  );

  const handleSelect = (option: SelectOption) => {
    setSelectedOption(option);
    onValueChange?.(option.value);
    setIsOpen(false);
  };

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.select,
          error ? styles.selectError : undefined,
          disabled ? styles.selectDisabled : undefined,
          style,
        ]}
        onPress={handleOpen}
        disabled={disabled}
      >
        <Text style={[
          styles.selectText,
          !selectedOption && styles.placeholderText,
          disabled && styles.textDisabled,
        ]}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={[styles.arrow, disabled && styles.textDisabled]}>▼</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedOption?.value === item.value && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[
                    styles.optionText,
                    selectedOption?.value === item.value && styles.optionTextSelected,
                  ]}>
                    {item.label}
                  </Text>
                  {selectedOption?.value === item.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  select: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectError: {
    borderColor: theme.colors.error,
  },
  selectDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.borderLight,
  },
  selectText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fonts.regular,
  },
  placeholderText: {
    color: theme.colors.textMuted,
  },
  textDisabled: {
    color: theme.colors.textMuted,
  },
  arrow: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  errorText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    width: '80%',
    maxHeight: '70%',
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.semibold,
  },
  closeButton: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  optionSelected: {
    backgroundColor: theme.colors.primaryLight,
  },
  optionText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
  },
  checkmark: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
  },
});

export default Select;
