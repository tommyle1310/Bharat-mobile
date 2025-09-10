import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  useTheme,
  useNavigation,
  useRoute,
  RouteProp,
} from '@react-navigation/native';
import VehicleCard from '../components/VehicleCard';
import Header from '../components/Header';
import FilterModal, { FilterOptions } from '../components/FilterModal';
import { theme } from '../theme';
import { vehicleServices, VehicleApi } from '../services/vehicleServices';
import { filterVehiclesByGroup } from '../services/searchServices';
import { images } from '../images';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ordinal } from '../libs/function';
import { Config, resolveBaseUrl } from '../config';
import { Vehicle } from '../data/vehicles';

type VehicleListScreenProps = NativeStackNavigationProp<
  RootStackParamList,
  'VehicleList'
>;

function formatKm(value: string | number) {
  const num = Number(value || 0);
  return num.toLocaleString(undefined) + ' km';
}

type Params = { group?: { type?: string; title: string } };

export default function VehicleListScreen() {
  useTheme();
  const navigation = useNavigation<VehicleListScreenProps>();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const selectedGroup = route.params?.group;

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);

  const headerTitle = selectedGroup?.title || 'Vehicles';

  const mapVehicleData = (data: any[]): Vehicle[] => {
    return (data || []).map((v: any) => ({
      id: v.vehicle_id,
      title: `${v.make} ${v.model} ${v.variant} (${v.manufacture_year})`,
      image: `${resolveBaseUrl()}/data-files/vehicles/${v.vehicleId}/${
        v.imgIndex
      }.${v.img_extension}`,
      kms: formatKm(v.odometer),
      vehicleId: v.vehicleId,
      imgIndex: v.imgIndex,
      fuel: v.fuel,
      owner: `${
        ordinal(Number(v.owner_serial)) === '0th'
          ? 'Current Owner'
          : `${ordinal(Number(v.owner_serial))} Owner`
      }` as string,
      region: v.state_code || v.state_rto,
      bidding_status: v.bidding_status,
      isFavorite: v.is_favorite ?? false,
      endTime: v.end_time,
      manager_name: v.manager_name,
      manager_phone: v.manager_phone,
      has_bidded: v.has_bidded,
    }));
  };

  const fetchVehicles = async () => {
    console.log('checking fetch vehicles called', selectedGroup);
    if (!selectedGroup?.title || !selectedGroup?.type) return;
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleServices.getVehiclesByGroup({
        title: selectedGroup.title || '',
        type: selectedGroup.type,
      });
      console.log(
        'cehck vehciles data',
        data?.[0]
      );
      const mapped = mapVehicleData(data);
      setVehicles(mapped);
    } catch (e: any) {
      console.log('cehck er', e.message, e);
      setError(e?.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (appliedFilters) {
        await fetchFilteredVehicles(appliedFilters);
      } else {
        await fetchVehicles();
      }
    } finally {
      setRefreshing(false);
    }
  }, [appliedFilters]);

  const fetchFilteredVehicles = async (filters: FilterOptions) => {
    if (!selectedGroup?.title || !selectedGroup?.type) return;
    setLoading(true);
    setError(null);
    try {
      const filterParams = {
        type: selectedGroup.type,
        title: selectedGroup.title,
        vehicle_type:
          filters.vehicleTypes.length > 0
            ? filters.vehicleTypes.join(',')
            : undefined,
        vehicle_fuel:
          filters.fuelTypes.length > 0
            ? filters.fuelTypes.join(',')
            : undefined,
        ownership:
          filters.ownership.length > 0
            ? filters.ownership.join(',')
            : undefined,
        rc_available: filters.rcAvailable || undefined,
        limit: 10,
        offset: 0,
      };

      console.log('Filtering with params:', filterParams);
      const data = await filterVehiclesByGroup(filterParams);
      const mapped = mapVehicleData(data);
      setVehicles(mapped);
    } catch (e: any) {
      console.log('Filter error:', e.message, e);
      setError(e?.message || 'Failed to filter vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appliedFilters) {
      fetchFilteredVehicles(appliedFilters);
    } else {
      fetchVehicles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup?.title, selectedGroup?.type, appliedFilters]);

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleFilterApply = (filters: FilterOptions) => {
    setAppliedFilters(filters);
    setShowFilterModal(false);
  };

  const handleFilterClose = () => {
    setShowFilterModal(false);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.stateText}>Loading vehicles…</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateContainer}>
          <Text style={[styles.stateText, { color: theme.colors.error }]}>
            {error}
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={vehicles}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <VehicleCard
          id={item.id}
            image={item.image}
            title={item.title}
            kms={item.kms}
            fuel={item.fuel}
            owner={item.owner}
            region={item.region}
            status={item.bidding_status}
            isFavorite={item.isFavorite}
            endTime={item.endTime}
            manager_name={item.manager_name}
            manager_phone={item.manager_phone}
            has_bidded={item.has_bidded}
            onBidSuccess={fetchVehicles} // Refetch vehicles when bid is successful
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.stateContainer}>
              <Text style={styles.stateText}>No vehicles found.</Text>
            </View>
          ) : null
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header
        onSearchPress={() =>
          navigation.navigate('Search', { group: selectedGroup })
        }
        type="search"
        isFiltering={
          appliedFilters &&
          (appliedFilters?.fuelTypes?.length > 0 ||
          appliedFilters?.vehicleTypes?.length > 0 ||
          appliedFilters?.ownership?.length > 0 ||
          appliedFilters?.rcAvailable !== null ||
          appliedFilters?.location !== '') ? true : false
        }
        canGoBack
        searchPlaceholder="Search vehicles..."
        onBackPress={() => navigation.goBack()}
        onFilterPress={handleFilterPress}
        title={headerTitle}
      />
      {renderContent()}

      <FilterModal
        visible={showFilterModal}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        initialFilters={appliedFilters || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.md,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  stateText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
  },
});
