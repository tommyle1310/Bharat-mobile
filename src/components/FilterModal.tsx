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
import { wishlistService, State, VehicleMake, WishlistConfiguration } from '../services/wishlistService';
import { useUser } from '../hooks/useUser';
import FullScreenLoader from './FullScreenLoader';
import { useToast } from './Toast';

const { height } = Dimensions.get('window');

export interface FilterOptions {
  location: string;
  vehicleTypes: string[];
  fuelTypes: string[];
  ownership: string[];
  rcAvailable: string | null;
  subcategories?: string[]; // Optional for wishlist mode
  states?: string[]; // For wishlist mode - multiple select
  makes?: string[]; // For wishlist mode
}


export interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  loading?: boolean;
  isWishlistMode?: boolean; // New prop to distinguish between filter and wishlist modes
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
  loading = false,
  isWishlistMode = false,
}) => {
  const { businessVertical } = useUser();
  const { show } = useToast();
  
  const [filters, setFilters] = useState<FilterOptions>({
    location: '',
    vehicleTypes: [],
    fuelTypes: [],
    ownership: [],
    rcAvailable: null,
    subcategories: [],
    states: [],
    makes: [],
  });

  const [lookupData, setLookupData] = useState<LookupData>({
    fuelTypes: [],
    ownership: [],
    vehicleTypes: [],
    vehicleSubcategories: [],
  });

  const [wishlistData, setWishlistData] = useState<{
    states: State[];
    makes: VehicleMake[];
    configuration: WishlistConfiguration | null;
  }>({
    states: [],
    makes: [],
    configuration: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [slideAnim] = useState(new Animated.Value(height));

  const loadLookupData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLookupData();
      console.log('cehck data', data.vehicleTypes)
      setLookupData(data);
    } catch (error) {
      console.error('Error fetching lookup data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWishlistData = async () => {
    if (!isWishlistMode) return;
    
    try {
      const [states, makes, configuration] = await Promise.all([
        wishlistService.getStates(),
        wishlistService.getVehicleMakes(),
        wishlistService.getWishlistConfiguration(),
      ]);

      setWishlistData({ states, makes, configuration });

      // Set initial filters based on configuration
      if (configuration?.success) {
        setFilters(prev => ({
          ...prev,
          vehicleTypes: configuration.configuration.vehicleType.map(String),
          subcategories: configuration.configuration.subcategory.map(String),
          states: configuration.configuration.state.map(String),
          makes: configuration.configuration.make.map(String),
        }));
      }
    } catch (error) {
      console.error('Error fetching wishlist data:', error);
      show('Failed to load wishlist configuration', 'error');
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
      
      // Load wishlist data if in wishlist mode
      if (isWishlistMode) {
        loadWishlistData();
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

  const handleSubcategoryToggle = (value: string) => {
    setFilters(prev => ({
      ...prev,
      subcategories: prev.subcategories?.includes(value)
        ? prev.subcategories.filter(v => v !== value)
        : [...(prev.subcategories || []), value],
    }));
  };

  const handleStateToggle = (value: string) => {
    setFilters(prev => ({
      ...prev,
      states: prev.states?.includes(value)
        ? prev.states.filter(v => v !== value)
        : [...(prev.states || []), value],
    }));
  };

  const handleMakeToggle = (value: string) => {
    setFilters(prev => ({
      ...prev,
      makes: prev.makes?.includes(value)
        ? prev.makes.filter(v => v !== value)
        : [...(prev.makes || []), value],
    }));
  };

  const handleRcAvailableSelect = (value: string) => {
    setFilters(prev => ({
      ...prev,
      rcAvailable: prev.rcAvailable === value ? null : value,
    }));
  };

  const handleApply = async () => {
    if (isWishlistMode) {
      setIsUpdating(true);
      try {
        // Get categoryId based on businessVertical
        let categoryId = '';
        if (businessVertical === 'I') {
          categoryId = '10';
        } else if (businessVertical === 'B') {
          categoryId = '20';
        } else if (businessVertical === 'A') {
          categoryId = '10,20';
        }

        const params: any = {};
        
        if (filters.vehicleTypes.length > 0) {
          params.vehicle_type = filters.vehicleTypes.join(',');
        }
        
        if (filters.states && filters.states.length > 0) {
          params.stateIds = filters.states.join(',');
        }
        
        if (filters.makes && filters.makes.length > 0) {
          params.make = filters.makes.join(',');
        }
        
        if (filters.subcategories && filters.subcategories.length > 0) {
          params.subcategoryIds = filters.subcategories.join(',');
        }

        if (categoryId) {
          params.categoryId = categoryId;
        }

        console.log('Updating wishlist with params:', params);
        
        const response = await wishlistService.updateWishlist(params);
        console.log('Wishlist update response:', response);
        
        show('Wishlist updated successfully', 'success');
        onClose();
      } catch (err) {
        console.error('Error updating wishlist:', err);
        show('Failed to update wishlist', 'error');
      } finally {
        setIsUpdating(false);
      }
    } else {
      onApply(filters);
      console.log('check fitlers', filters)
      onClose();
    }
  };

  const handleReset = () => {
    setFilters({
      location: '',
      vehicleTypes: [],
      fuelTypes: [],
      ownership: [],
      rcAvailable: null,
      subcategories: [],
      states: [],
      makes: [],
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
            {isLoading ? (
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
                        key={option.ownership_id}
                        label={option.ownership || ''}
                        value={option?.ownership_id?.toString() || ''}
                        checked={filters.ownership.includes(option?.ownership_id?.toString() || '')}
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

                {/* States Section - Only for Wishlist Mode */}
                {isWishlistMode && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>States</Text>
                    <View style={styles.checkboxGrid}>
                      {wishlistData.states.map((state) => (
                        <Checkbox
                          key={state.id}
                          label={`${state.state} (${state.region})`}
                          value={state.id.toString()}
                          checked={filters.states?.includes(state.id.toString()) || false}
                          onToggle={handleStateToggle}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {/* Vehicle Makes Section - Only for Wishlist Mode */}
                {isWishlistMode && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vehicle Makes</Text>
                    <View style={styles.checkboxGrid}>
                      {wishlistData.makes.map((make) => (
                        <Checkbox
                          key={make.id}
                          label={make.make_name}
                          value={make.id.toString()}
                          checked={filters.makes?.includes(make.id.toString()) || false}
                          onToggle={handleMakeToggle}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {/* Vehicle Subcategories Section - Only for Wishlist Mode */}
                {isWishlistMode && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vehicle Subcategories</Text>
                    <View style={styles.checkboxGrid}>
                      {lookupData.vehicleSubcategories.map((option) => (
                        <Checkbox
                          key={option.sub_category_id}
                          label={option.sub_category || ''}
                          value={option.sub_category_id.toString()}
                          checked={filters.subcategories?.includes(option.sub_category_id.toString()) || false}
                          onToggle={handleSubcategoryToggle}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Reset"
              variant="outline"
              onPress={handleReset}
              style={styles.resetButton}
              disabled={loading || isLoading || isUpdating}
            />
            <Button
              title={isWishlistMode ? "Update Wishlist" : "Apply Filters"}
              variant="primary"
              onPress={handleApply}
              style={styles.applyButton}
              disabled={loading || isLoading || isUpdating}
            />
          </View>
        </Animated.View>
      </View>
      
      {/* FullScreenLoader for wishlist updates */}
      <FullScreenLoader visible={isUpdating} />
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
