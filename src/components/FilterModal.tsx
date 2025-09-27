import React, { useState, useEffect, useRef } from 'react';
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
import { wishlistService, State, VehicleMake, WishlistConfiguration, Seller } from '../services/wishlistService';
import { useUser } from '../hooks/useUser';
import FullScreenLoader from './FullScreenLoader';
import { useToast } from './Toast';
import CustomModal from './Modal';
import Input from './Input';

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
  sellerIds?: string[]; // For wishlist mode - multiple select
  selectedSellers?: Seller[]; // For wishlist mode - multiple select
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
    sellerIds: [],
    selectedSellers: [],
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
  
  // Seller search modal state
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [sellerSearchQuery, setSellerSearchQuery] = useState('');
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isSearchingSellers, setIsSearchingSellers] = useState(false);
  
  // State search modal state
  const [showStateModal, setShowStateModal] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [searchedStates, setSearchedStates] = useState<State[]>([]);
  const [isSearchingStates, setIsSearchingStates] = useState(false);
  
  // Debounce timers
  const sellerSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateSearchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadLookupData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLookupData();
      console.log('cehck data', data.vehicleTypes)
      setLookupData(data);
      
      // Also load states for regular filter mode
      if (!isWishlistMode) {
        const states = await wishlistService.getStates();
        setWishlistData(prev => ({ ...prev, states }));
      }
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

  const searchSellers = async (query: string) => {
    if (!query.trim()) {
      setSellers([]);
      return;
    }
    
    setIsSearchingSellers(true);
    try {
      const results = await wishlistService.searchSellers(query);
      setSellers(results);
    } catch (error) {
      console.error('Error searching sellers:', error);
      // Do not show toast on search errors; silent fail
    } finally {
      setIsSearchingSellers(false);
    }
  };

  const debouncedSearchSellers = (query: string) => {
    // Clear existing timeout
    if (sellerSearchTimeoutRef.current) {
      clearTimeout(sellerSearchTimeoutRef.current);
    }
    
    // Set new timeout
    sellerSearchTimeoutRef.current = setTimeout(() => {
      searchSellers(query);
    }, 300);
  };

  const searchStates = async (query: string) => {
    if (!query.trim()) {
      setSearchedStates([]);
      return;
    }
    
    setIsSearchingStates(true);
    try {
      const results = await wishlistService.searchStates(query);
      setSearchedStates(results);
    } catch (error) {
      console.error('Error searching states:', error);
      // Do not show toast on search errors; silent fail
    } finally {
      setIsSearchingStates(false);
    }
  };

  const debouncedSearchStates = (query: string) => {
    // Clear existing timeout
    if (stateSearchTimeoutRef.current) {
      clearTimeout(stateSearchTimeoutRef.current);
    }
    
    // Set new timeout
    stateSearchTimeoutRef.current = setTimeout(() => {
      searchStates(query);
    }, 300);
  };

  const handleSellerToggle = (seller: Seller) => {
    setFilters(prev => {
      const isSelected = prev.selectedSellers?.some(s => s.seller_id === seller.seller_id) || false;
      
      if (isSelected) {
        // Remove seller
        const updatedSellers = prev.selectedSellers?.filter(s => s.seller_id !== seller.seller_id) || [];
        const updatedSellerIds = prev.sellerIds?.filter(id => id !== seller.seller_id.toString()) || [];
        return {
          ...prev,
          selectedSellers: updatedSellers,
          sellerIds: updatedSellerIds,
        };
      } else {
        // Add seller
        const updatedSellers = [...(prev.selectedSellers || []), seller];
        const updatedSellerIds = [...(prev.sellerIds || []), seller.seller_id.toString()];
        return {
          ...prev,
          selectedSellers: updatedSellers,
          sellerIds: updatedSellerIds,
        };
      }
    });
  };

  const handleStateToggle = (state: State) => {
    setFilters(prev => {
      const isSelected = prev.states?.includes(state.id.toString()) || false;
      
      if (isSelected) {
        // Remove state
        const updatedStates = prev.states?.filter(id => id !== state.id.toString()) || [];
        return {
          ...prev,
          states: updatedStates,
        };
      } else {
        // Add state
        const updatedStates = [...(prev.states || []), state.id.toString()];
        return {
          ...prev,
          states: updatedStates,
        };
      }
    });
  };

  // Helper function to get state by ID with fallback
  const getStateById = (stateId: string): State | null => {
    if (!wishlistData.states || !Array.isArray(wishlistData.states)) {
      return null;
    }
    return wishlistData.states.find(s => s.id.toString() === stateId) || null;
  };

  // Select All / Clear helpers
  const handleSelectAllStates = () => {
    if (!wishlistData.states?.length) return;
    const allIds = wishlistData.states.map(s => s.id.toString());
    setFilters(prev => ({ ...prev, states: allIds }));
  };

  const handleClearAllStates = () => {
    setFilters(prev => ({ ...prev, states: [] }));
  };

  const handleSelectAllSellerResults = () => {
    if (!sellers?.length) return;
    setFilters(prev => {
      const existingIds = new Set(prev.sellerIds || []);
      const mergedIds = [...existingIds, ...sellers.map(s => s.seller_id.toString())] as any;
      // Ensure unique
      const uniqueIds = Array.from(new Set(mergedIds as string[]));
      const mergedSellers = [...(prev.selectedSellers || [])];
      sellers.forEach(s => {
        if (!mergedSellers.some(ms => ms.seller_id === s.seller_id)) {
          mergedSellers.push(s);
        }
      });
      return { ...prev, sellerIds: uniqueIds, selectedSellers: mergedSellers };
    });
  };

  const handleClearAllSellers = () => {
    setFilters(prev => ({ ...prev, sellerIds: [], selectedSellers: [] }));
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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (sellerSearchTimeoutRef.current) {
        clearTimeout(sellerSearchTimeoutRef.current);
      }
      if (stateSearchTimeoutRef.current) {
        clearTimeout(stateSearchTimeoutRef.current);
      }
    };
  }, []);

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

        if (filters.sellerIds && filters.sellerIds.length > 0) {
          params.sellerId = filters.sellerIds.join(',');
        }

        if (categoryId) {
          params.categoryId = categoryId;
        }

        console.log('Updating wishlist with params:', params);
        
        const response = await wishlistService.updateWishlist(params);
        console.log('Wishlist update response:', response);
        
        show('Wishlist updated successfully', 'success');
        
        // Call onApply to trigger refresh in parent component
        onApply(filters);
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
      sellerIds: [],
      selectedSellers: [],
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
            <Text style={styles.title}>{isWishlistMode ? 'My Preferences' : 'Filter Vehicles'}</Text>
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
                {isWishlistMode ? (
                  <>
                    {/* Vehicle Types Section - Wishlist Mode */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Vehicle Types</Text>
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

                    {/* States Section - Wishlist Mode */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Search States</Text>
                      <Pressable
                        style={styles.searchInputContainer}
                        onPress={() => setShowStateModal(true)}
                      >
                        <Text style={[
                          styles.searchInputText,
                          (!filters.states || filters.states.length === 0) && styles.searchInputPlaceholder
                        ]}>
                          {filters.states && filters.states.length > 0 
                            ? `${filters.states.length} state(s) selected`
                            : 'Search for states...'}
                        </Text>
                        <Icon name="search" size={20} color={theme.colors.textMuted} />
                      </Pressable>
                      
                      {filters.states && filters.states.length > 0 && wishlistData.states && (
                        <View style={styles.selectedSellersContainer}>
                          {filters.states.map((stateId) => {
                            const state = getStateById(stateId);
                            if (!state) return null;
                            return (
                              <View key={state.id} style={styles.selectedSellerChip}>
                                <Text style={styles.selectedSellerName}>{state.state} ({state.region})</Text>
                                <Pressable
                                  style={styles.removeSellerButton}
                                  onPress={() => handleStateToggle(state)}
                                >
                                  <Icon name="close" size={16} color={theme.colors.textInverse} />
                                </Pressable>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>

                    {/* Vehicle Makes Section - Wishlist Mode */}
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

                    {/* Vehicle Subcategories Section - Wishlist Mode */}
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

                    {/* Seller Search Section - Wishlist Mode */}
                    <View style={styles.section}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.sectionTitle}>Search Sellers</Text>
                        <View style={styles.actionsRow}>
                          <Button title="Clear" variant="outline" onPress={handleClearAllSellers} style={styles.smallBtn} />
                        </View>
                      </View>
                      <Pressable
                        style={styles.searchInputContainer}
                        onPress={() => setShowSellerModal(true)}
                      >
                        <Text style={[
                          styles.searchInputText,
                          (!filters.selectedSellers || filters.selectedSellers.length === 0) && styles.searchInputPlaceholder
                        ]}>
                          {filters.selectedSellers && filters.selectedSellers.length > 0 
                            ? `${filters.selectedSellers.length} seller(s) selected`
                            : 'Search for sellers...'}
                        </Text>
                        <Icon name="search" size={20} color={theme.colors.textMuted} />
                      </Pressable>
                      
                      {filters.selectedSellers && filters.selectedSellers.length > 0 && (
                        <View style={styles.selectedSellersContainer}>
                          {filters.selectedSellers.map((seller, index) => (
                            <View key={seller.seller_id} style={styles.selectedSellerChip}>
                              <Text style={styles.selectedSellerName}>{seller.name}</Text>
                              <Pressable
                                style={styles.removeSellerButton}
                                onPress={() => handleSellerToggle(seller)}
                              >
                                <Icon name="close" size={16} color={theme.colors.textInverse} />
                              </Pressable>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </>
                ) : (
                  <>
                    {/* Location Section */}
                    <View style={styles.section}>
                      <View style={styles.rowBetween}>
                        <Text style={styles.sectionTitle}>Search States</Text>
                        <View style={styles.actionsRow}>
                          <Button title="Select All" variant="outline" onPress={handleSelectAllStates} style={styles.smallBtn} />
                          <Button title="Clear" variant="outline" onPress={handleClearAllStates} style={styles.smallBtn} />
                        </View>
                      </View>
                      <Pressable
                        style={styles.searchInputContainer}
                        onPress={() => setShowStateModal(true)}
                      >
                        <Text style={[
                          styles.searchInputText,
                          (!filters.states || filters.states.length === 0) && styles.searchInputPlaceholder
                        ]}>
                          {filters.states && filters.states.length > 0 
                            ? `${filters.states.length} state(s) selected`
                            : 'Search for states...'}
                        </Text>
                        <Icon name="search" size={20} color={theme.colors.textMuted} />
                      </Pressable>
                      
                      {filters.states && filters.states.length > 0 && wishlistData.states && (
                        <View style={styles.selectedSellersContainer}>
                          {filters.states.map((stateId) => {
                            const state = getStateById(stateId);
                            if (!state) return null;
                            return (
                              <View key={state.id} style={styles.selectedSellerChip}>
                                <Text style={styles.selectedSellerName}>{state.state} ({state.region})</Text>
                                <Pressable
                                  style={styles.removeSellerButton}
                                  onPress={() => handleStateToggle(state)}
                                >
                                  <Icon name="close" size={16} color={theme.colors.textInverse} />
                                </Pressable>
                              </View>
                            );
                          })}
                        </View>
                      )}
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
                  </>
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
      
      {/* Seller Search Modal */}
      <CustomModal
        visible={showSellerModal}
        title="Search Seller"
        onClose={() => {
          setShowSellerModal(false);
          setSellerSearchQuery('');
          setSellers([]);
        }}
      >
        <View style={styles.sellerModalContent}>
          <Input
            placeholder="Search for a seller..."
            value={sellerSearchQuery}
            onChangeText={(text) => {
              setSellerSearchQuery(text);
              debouncedSearchSellers(text);
            }}
            style={styles.sellerSearchInput}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
            <Button title="Select All Results" variant="outline" onPress={handleSelectAllSellerResults} style={styles.smallBtn} />
            <Button title="Clear Selected" variant="outline" onPress={handleClearAllSellers} style={styles.smallBtn} />
          </View>
          
          {isSearchingSellers ? (
            <View style={styles.sellerLoadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.sellerLoadingText}>Searching...</Text>
            </View>
          ) : (
            <ScrollView style={styles.sellerList} showsVerticalScrollIndicator={false}>
              {sellers.map((seller, i) => {
                const isSelected = filters.selectedSellers?.some(s => s.seller_id === seller.seller_id) || false;
                return (
                  <Pressable
                    key={i}
                    style={styles.sellerItem}
                    onPress={() => handleSellerToggle(seller)}
                  >
                    <View style={styles.sellerItemLeft}>
                      <View style={[styles.sellerCheckbox, isSelected && styles.sellerCheckboxChecked]}>
                        {isSelected && <Icon name="checkmark" size={16} color={theme.colors.textInverse} />}
                      </View>
                      <View style={styles.sellerInfo}>
                        <Text style={styles.sellerName}>{seller.name}</Text>
                        <Text style={styles.sellerEmail}>{seller.email}</Text>
                        <Text style={styles.sellerPhone}>{seller.phone}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
              {sellers.length === 0 && sellerSearchQuery.trim() && (
                <Text style={styles.noSellersText}>No sellers found</Text>
              )}
            </ScrollView>
          )}
        </View>
      </CustomModal>
      
      {/* State Search Modal */}
      <CustomModal
        visible={showStateModal}
        title="Search States"
        onClose={() => {
          setShowStateModal(false);
          setStateSearchQuery('');
          setSearchedStates([]);
        }}
      >
        <View style={styles.sellerModalContent}>
          <Input
            placeholder="Search for states..."
            value={stateSearchQuery}
            onChangeText={(text) => {
              setStateSearchQuery(text);
              debouncedSearchStates(text);
            }}
            style={styles.sellerSearchInput}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
            <Button title="Select All" variant="outline" onPress={() => {
              if (searchedStates.length > 0) {
                setFilters(prev => ({ ...prev, states: Array.from(new Set([...(prev.states || []), ...searchedStates.map(s => s.id.toString())])) }));
              } else {
                handleSelectAllStates();
              }
            }} style={styles.smallBtn} />
            <Button title="Clear" variant="outline" onPress={handleClearAllStates} style={styles.smallBtn} />
          </View>
          
          {isSearchingStates ? (
            <View style={styles.sellerLoadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.sellerLoadingText}>Searching...</Text>
            </View>
          ) : (
            <ScrollView style={styles.sellerList} showsVerticalScrollIndicator={false}>
              {searchedStates.map((state, i) => {
                const isSelected = filters.states?.includes(state.id.toString()) || false;
                return (
                  <Pressable
                    key={i}
                    style={styles.sellerItem}
                    onPress={() => handleStateToggle(state)}
                  >
                    <View style={styles.sellerItemLeft}>
                      <View style={[styles.sellerCheckbox, isSelected && styles.sellerCheckboxChecked]}>
                        {isSelected && <Icon name="checkmark" size={16} color={theme.colors.textInverse} />}
                      </View>
                      <View style={styles.sellerInfo}>
                        <Text style={styles.sellerName}>{state.state}</Text>
                        <Text style={styles.sellerEmail}>{state.region}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
              {searchedStates.length === 0 && stateSearchQuery.trim() && (
                <Text style={styles.noSellersText}>No states found</Text>
              )}
            </ScrollView>
          )}
        </View>
      </CustomModal>
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
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.bold,
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
  // Seller search styles
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.card,
  },
  searchInputText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
    flex: 1,
  },
  searchInputPlaceholder: {
    color: theme.colors.textMuted,
  },
  sellerModalContent: {
    maxHeight: 400,
  },
  sellerSearchInput: {
    marginBottom: theme.spacing.md,
  },
  sellerLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  sellerLoadingText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  sellerList: {
    maxHeight: 300,
  },
  sellerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.semibold,
    marginBottom: theme.spacing.xs,
  },
  sellerEmail: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
    marginBottom: theme.spacing.xs,
  },
  sellerPhone: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  noSellersText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
    fontFamily: theme.fonts.regular,
  },
  // Multiple seller selection styles
  selectedSellersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  selectedSellerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.md,
  },
  selectedSellerName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.medium,
    marginRight: theme.spacing.xs,
  },
  removeSellerButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerCheckbox: {
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
  sellerCheckboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallBtn: {
    height: 36,
    paddingHorizontal: theme.spacing.md,
  },
});

export default FilterModal;
