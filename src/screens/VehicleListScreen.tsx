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
  NavigationProp,
} from '@react-navigation/native';
import VehicleCard from '../components/VehicleCard';
import Header from '../components/Header';
import FilterModal, { FilterOptions } from '../components/FilterModal';
import { theme } from '../theme';
import { vehicleServices, VehicleApi } from '../services/vehicleServices';
import { filterVehiclesByGroup } from '../services/searchServices';
import { images } from '../images';
import { RootStackParamList } from '../navigation/RootNavigator';
import { ordinal } from '../libs/function';
import { Config, resolveBaseUrl } from '../config';
import { Vehicle } from '../data/vehicles';
import { socketService, normalizeAuctionEnd } from '../services/socket';
import { useUser } from '../hooks/useUser';
import { bidEvents } from '../services/eventBus';
import { EBusinessVertical } from '../types/common';

export type VehicleListSelectedGroup = { type?: string; title: string; businessVertical?: EBusinessVertical; bucketId?: number };

function formatKm(value: string | number) {
  const num = Number(value || 0);
  return num.toLocaleString(undefined) + ' km';
}

type Params = { group?: VehicleListSelectedGroup };

type Props = { selectedGroup?: VehicleListSelectedGroup; businessVertical?: EBusinessVertical; onBackToGroups?: () => void };

export default function VehicleListScreen({ selectedGroup: selectedGroupProp, businessVertical, onBackToGroups }: Props) {
  useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const selectedGroupRoute = route.params?.group;
  const selectedGroup = selectedGroupProp || selectedGroupRoute;
  const { buyerId, businessVertical: globalBV } = useUser();
  const effectiveBV: EBusinessVertical = (businessVertical as any) || (selectedGroup?.businessVertical as any) || (globalBV as any) || 'A';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const headerTitle = selectedGroup?.title || 'Vehicles';

  const mapVehicleData = (data: any[]): Vehicle[] => {
    return (data || []).map((v: any) => {
      const ownerSerialNum = Number(v.owner_serial);
      const ownerStr = !Number.isFinite(ownerSerialNum) || ownerSerialNum <= 0
        ? '-'
        : (ordinal(ownerSerialNum) === '0th'
          ? 'Current Owner'
          : `${ordinal(ownerSerialNum)} Owner`);
      const title = `${v.make || '-'} ${v.model || '-'} ${v.variant || '-'} (${v.manufacture_year || '-'})`;
      return {
        id: (v.vehicle_id)?.toString?.() || String(v.vehicle_id),
        title,
        image: `${resolveBaseUrl()}/data-files/vehicles/${v.vehicleId}/${v.imgIndex}.${v.img_extension}`,
        kms: formatKm(v.odometer),
        vehicleId: v.vehicleId,
        imgIndex: v.imgIndex,
        fuel: v.fuel || '-',
        owner: ownerStr as string,
        region: v.state_code || v.state_rto || '-',
        bidding_status: v.bidding_status,
        isFavorite: v.is_favorite ?? false,
        endTime: v.end_time,
        manager_name: v.manager_name || '-',
        transmissionType: v.transmissionType || '-',
        rc_availability: v.rc_availability,
        repo_date: v.repo_date,
        regs_no: v.regs_no || '-',
        manager_phone: v.manager_phone || '-',
        has_bidded: v.has_bidded,
      } as Vehicle;
    });
  };

  const fetchVehicles = async (page: number = 1, append: boolean = false) => {
    console.log('checking fetch vehicles called', selectedGroup, 'page:', page);
    if (!selectedGroup?.title && !selectedGroup?.bucketId) return;
    
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    
    try {
      let response;
      
      if (effectiveBV === EBusinessVertical.BANK && selectedGroup.bucketId) {
        // For Bank vertical with bucketId, use the bucket-specific API
        response = await vehicleServices.getVehiclesByBucket({
          businessVertical: effectiveBV,
          bucketId: selectedGroup.bucketId,
          page,
        });
      } else {
        // For other cases, use the original group-based API
        response = await vehicleServices.getVehiclesByGroup({
          title: selectedGroup.title || '',
          type: selectedGroup.type || '',
          businessVertical: effectiveBV,
          page,
          bucketId: selectedGroup.bucketId,
        });
      }
    
      const mapped = mapVehicleData(response.data);
      
      if (append) {
        setVehicles(prev => [...prev, ...mapped]);
      } else {
        setVehicles(mapped);
      }
      
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setHasMoreData(response.page < response.totalPages);
    } catch (e: any) {
      console.log('cehck er', e.message, e);
      setError(e?.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMoreData(true);
    try {
      if (appliedFilters) {
        await fetchFilteredVehicles(appliedFilters, 1, false);
      } else {
        await fetchVehicles(1, false);
      }
    } finally {
      setRefreshing(false);
    }
  }, [appliedFilters, selectedGroup?.title, selectedGroup?.type, selectedGroup?.bucketId, effectiveBV]);

  const loadMoreVehicles = useCallback(async () => {
    if (loadingMore || !hasMoreData) return;
    
    const nextPage = currentPage + 1;
    if (appliedFilters) {
      await fetchFilteredVehicles(appliedFilters, nextPage, true);
    } else {
      await fetchVehicles(nextPage, true);
    }
  }, [currentPage, loadingMore, hasMoreData, appliedFilters]);

  const fetchFilteredVehicles = async (filters: FilterOptions, page: number = 1, append: boolean = false) => {
    if (!selectedGroup?.title || !selectedGroup?.type) return;
    
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
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
        businessVertical: effectiveBV,
        page,
      } as any;

      console.log('Filtering with params:', filterParams);
      const response = await filterVehiclesByGroup(filterParams);
      const dataset = (response as any)?.data || response || [];
      const mapped = mapVehicleData(dataset);
      
      if (append) {
        setVehicles(prev => [...prev, ...mapped]);
      } else {
        setVehicles(mapped);
      }
      
      // Update pagination info if response contains it
      if ((response as any)?.page) {
        setCurrentPage((response as any).page);
        setTotalPages((response as any).totalPages);
        setHasMoreData((response as any).page < (response as any).totalPages);
      }
    } catch (e: any) {
      console.log('Filter error:', e.message, e);
      setError(e?.message || 'Failed to filter vehicles');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if ((selectedGroup?.title && selectedGroup?.type) || (selectedGroup?.bucketId && effectiveBV === EBusinessVertical.BANK)) {
      setCurrentPage(1);
      setHasMoreData(true);
      if (appliedFilters) {
        fetchFilteredVehicles(appliedFilters, 1, false);
      } else {
        fetchVehicles(1, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup?.title, selectedGroup?.type, selectedGroup?.bucketId, appliedFilters, effectiveBV]);

  // Join buyer room once buyerId is known
  useEffect(() => {
    if (buyerId != null) {
      try {
        socketService.setBuyerId(Number(buyerId));
      } catch {}
    }
  }, [buyerId]);

  // Subscribe to realtime events to update list items
  useEffect(() => {
    const disposers: Array<() => void> = [];

    disposers.push(
      socketService.onIsWinning(({ vehicleId, auctionEndDttm }) => {
        setVehicles(prev =>
          prev.map(v => {
            if (Number(v.id) !== Number(vehicleId)) return v;
            const updated: any = { ...v, has_bidded: true as any, bidding_status: 'Winning' as any };
            if (auctionEndDttm) updated.endTime = normalizeAuctionEnd(auctionEndDttm);
            return updated;
          }),
        );
      }),
    );

    disposers.push(
      socketService.onIsLosing(({ vehicleId, auctionEndDttm }) => {
        setVehicles(prev =>
          prev.map(v => {
            if (Number(v.id) !== Number(vehicleId)) return v;
            const updated: any = { ...v, has_bidded: true as any, bidding_status: 'Losing' as any };
            if (auctionEndDttm) updated.endTime = normalizeAuctionEnd(auctionEndDttm);
            return updated;
          }),
        );
      }),
    );

    disposers.push(
      socketService.onVehicleEndtimeUpdate(({ vehicleId, auctionEndDttm }) => {
        console.log('check auctin end', auctionEndDttm)
        setVehicles(prev =>
          prev.map(v =>
            Number(v.id) === Number(vehicleId)
              ? { ...v, endTime: normalizeAuctionEnd(auctionEndDttm) }
              : v,
          ),
        );
      }),
    );

    disposers.push(
      socketService.onVehicleWinnerUpdate(({ vehicleId, winnerBuyerId, loserBuyerId, auctionEndDttm }) => {
        const myId = buyerId != null ? Number(buyerId) : null;
        setVehicles(prev =>
          prev.map(v => {
            if (Number(v.id) !== Number(vehicleId)) return v;
            let status = v.bidding_status as any;
            if (myId && winnerBuyerId === myId) status = 'Winning';
            else if (myId && loserBuyerId === myId) status = 'Losing';
            const updated: any = { ...v, bidding_status: status };
            if (auctionEndDttm) {
              updated.endTime = normalizeAuctionEnd(auctionEndDttm);
            }
            return updated;
          }),
        );
      }),
    );

    return () => {
      disposers.forEach(d => d());
    };
  }, [buyerId]);

  // Listen for bid success events to refresh data
  useEffect(() => {
    const unsubscribe = bidEvents.subscribe(() => {
      handleBidSuccess();
    });
    return unsubscribe;
  }, [appliedFilters]);

  // Listen for auto-bid success events to refresh data
  useEffect(() => {
    const unsubscribe = bidEvents.subscribeAutoBid(() => {
      handleBidSuccess();
    });
    return unsubscribe;
  }, [appliedFilters]);

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

  const handleFavoriteToggle = (vehicleId: string, shouldToggle: boolean = true) => {
    if (shouldToggle) {
      setVehicles(prevData => 
        prevData.map(vehicle => 
          vehicle.id === vehicleId 
            ? { ...vehicle, isFavorite: !vehicle.isFavorite }
            : vehicle
        )
      );
    }
  };

  const handleBidSuccess = () => {
    // Force refresh vehicles data
    setCurrentPage(1);
    setHasMoreData(true);
    if (appliedFilters) {
      fetchFilteredVehicles(appliedFilters, 1, false);
    } else {
      fetchVehicles(1, false);
    }
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
        onEndReached={loadMoreVehicles}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingMoreText}>Loading more vehicles...</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <VehicleCard
            id={item.id}
            transmissionType={item.transmissionType}
            rc_availability={item.rc_availability}
            repo_date={item.repo_date}
            regs_no={item.regs_no}
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
            onFavoriteToggle={handleFavoriteToggle}
            onBidSuccess={handleBidSuccess}
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
        onSearchPress={() => {
          if (selectedGroup) {
            // Keep search behavior if present in stack usage
            (navigation as any).navigate('Search', { group: selectedGroup });
          }
        }}
        
        type="search"
        isFiltering={
          appliedFilters &&
          (appliedFilters?.fuelTypes?.length > 0 ||
          appliedFilters?.vehicleTypes?.length > 0 ||
          appliedFilters?.ownership?.length > 0 ||
          appliedFilters?.rcAvailable !== null ||
          appliedFilters?.location !== '') ? true : false
        }
        canGoBack={true}
        searchPlaceholder="Search vehicles..."
        onBackPress={() => {
          if (onBackToGroups) onBackToGroups();
          else (navigation as any).goBack();
        }}
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
  loadingMoreContainer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
  },
});

// Socket listeners: join buyer room and update list in realtime
// Hook must live inside component; append below component export with inline declaration is not allowed
// So we extend the component with an effect by reopening function scope above

