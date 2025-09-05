import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../theme';
import Select from './Select';
import Button from './Button';
import { fetchLookupData, LookupData, LookupItem } from '../services/searchServices';

const { height } = Dimensions.get('window');

export interface FilterOptions {
  location: string;
  vehicleTypes: string[];
  fuelTypes: string[];
  ownership: string[];
  rcAvailable: string | null;
}


export interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const locationOptions = [
  { label: 'North', value: 'North' },
  { label: 'South', value: 'South' },
  { label: 'East', value: 'East' },
  { label: 'West', value: 'West' },
];

const rcAvailableOptions = [
  { label: 'Yes', value: 'true' },
  { label: 'No', value: 'false' },
];

interface CheckboxProps {
  label: string;
  value: string;
  checked: boolean;
  onToggle: (value: string) => void;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, value, checked, onToggle }) => (
  <Pressable
    style={styles.checkboxContainer}
    onPress={() => onToggle(value)}
  >
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <Icon name="checkmark" size={16} color={theme.colors.textInverse} />}
    </View>
    <Text style={[styles.checkboxLabel, checked && styles.checkboxLabelChecked]}>
      {label}
    </Text>
  </Pressable>
);

interface RadioButtonProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
}

const RadioButton: React.FC<RadioButtonProps> = ({ label, value, selected, onSelect }) => (
  <Pressable
    style={styles.radioContainer}
    onPress={() => onSelect(value)}
  >
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
      {label}
    </Text>
  </Pressable>
);

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    vehicleTypes: [],
    fuelTypes: [],
    ownership: [],
    rcAvailable: null,
  });

  const [lookupData, setLookupData] = useState<LookupData>({
    fuelTypes: [],
    ownership: [],
    vehicleTypes: [],
  });

  const [loading, setLoading] = useState(false);
  const [slideAnim] = useState(new Animated.Value(height));

  const loadLookupData = async () => {
    setLoading(true);
    try {
      const data = await fetchLookupData();
      setLookupData(data);
    } catch (error) {
      console.error('Error fetching lookup data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Fetch lookup data when modal opens
      if (lookupData.fuelTypes.length === 0) {
        loadLookupData();
      }
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  const handleVehicleTypeToggle = (value: string) => {
    setFilters(prev => ({
      ...prev,
      vehicleTypes: prev.vehicleTypes.includes(value)
        ? prev.vehicleTypes.filter(v => v !== value)
        : [...prev.vehicleTypes, value],
    }));
  };

  const handleFuelTypeToggle = (value: string) => {
    setFilters(prev => ({
      ...prev,
      fuelTypes: prev.fuelTypes.includes(value)
        ? prev.fuelTypes.filter(v => v !== value)
        : [...prev.fuelTypes, value],
    }));
  };

  const handleOwnershipToggle = (value: string) => {
    setFilters(prev => ({
      ...prev,
      ownership: prev.ownership.includes(value)
        ? prev.ownership.filter(v => v !== value)
        : [...prev.ownership, value],
    }));
  };

  const handleRcAvailableSelect = (value: string) => {
    setFilters(prev => ({
      ...prev,
      rcAvailable: prev.rcAvailable === value ? null : value,
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      location: '',
      vehicleTypes: [],
      fuelTypes: [],
      ownership: [],
      rcAvailable: null,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Filter Vehicles</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading filter options...</Text>
              </View>
            ) : (
              <>
                {/* Location Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <Select
                    placeholder="Select State"
                    value={filters.location}
                    options={locationOptions}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}
                  />
                </View>

                {/* Vehicle Types Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Select Vehicles</Text>
                  <View style={styles.checkboxGrid}>
                    {lookupData.vehicleTypes.map((option) => (
                      <Checkbox
                        key={option.id}
                        label={option.vehicle_type || ''}
                        value={option.id.toString()}
                        checked={filters.vehicleTypes.includes(option.id.toString())}
                        onToggle={handleVehicleTypeToggle}
                      />
                    ))}
                  </View>
                </View>

                {/* Fuel Types Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Fuel Type</Text>
                  <View style={styles.checkboxGrid}>
                    {lookupData.fuelTypes.map((option) => (
                      <Checkbox
                        key={option.id}
                        label={option.fuel_type || ''}
                        value={option.id.toString()}
                        checked={filters.fuelTypes.includes(option.id.toString())}
                        onToggle={handleFuelTypeToggle}
                      />
                    ))}
                  </View>
                </View>

                {/* Ownership Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Ownership</Text>
                  <View style={styles.checkboxRow}>
                    {lookupData.ownership.map((option) => (
                      <Checkbox
                        key={option.id}
                        label={option.ownership_serial || ''}
                        value={option.id.toString()}
                        checked={filters.ownership.includes(option.id.toString())}
                        onToggle={handleOwnershipToggle}
                      />
                    ))}
                  </View>
                </View>

                {/* RC Available Section */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>RC Available</Text>
                  <View style={styles.radioRow}>
                    {rcAvailableOptions.map((option) => (
                      <RadioButton
                        key={option.value}
                        label={option.label}
                        value={option.value}
                        selected={filters.rcAvailable === option.value}
                        onSelect={handleRcAvailableSelect}
                      />
                    ))}
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Reset"
              variant="outline"
              onPress={handleReset}
              style={styles.resetButton}
              disabled={loading}
            />
            <Button
              title="Apply Filters"
              variant="primary"
              onPress={handleApply}
              style={styles.applyButton}
              disabled={loading}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    height: height * 0.85,
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.semibold,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.semibold,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: theme.spacing.sm,
    flexWrap: 'wrap'
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: theme.spacing.xl,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: theme.radii.xs,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    flex: 1,
  },
  checkboxLabelChecked: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  radioSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  radioLabel: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  radioLabelSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.regular,
  },
});

export default FilterModal;
