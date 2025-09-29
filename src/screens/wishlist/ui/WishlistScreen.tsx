import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, Text, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { watchlistService } from '../../../services/watchlistService';
import { wishlistService } from '../../../services/wishlistService';
import VehicleCard from '../../../components/VehicleCard';
import Header from '../../../components/Header';
import { theme } from '../../../theme';
import { FilterModal } from '../../../components';
import { FilterOptions } from '../../../components/FilterModal';
import { Vehicle } from '../../../types/Vehicle';
import { resolveBaseUrl } from '../../../config';
import { ordinal } from '../../../libs/function';
import { watchlistEvents, bidEvents } from '../../../services/eventBus';
import { socketService, normalizeAuctionEnd } from '../../../services/socket';
import { useUser } from '../../../hooks/useUser';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WishlistScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { buyerId } = useUser();
  const [data, setData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const formatKm = (value: string | number) => {
    const num = Number(value || 0);
    return num.toLocaleString(undefined) + ' km';
  };

  const mapVehicleData = (data: any[]): Vehicle[] => {
    return (data || []).map((v: any) => ({
      id: v.vehicle_id || v.id,
      title: `${v.make} ${v.model} ${v.variant} (${v.manufacture_year})`,
      image: `${resolveBaseUrl()}/data-files/vehicles/${v.vehicleId || v.vehicle_id}/${
        v.imgIndex || v.vehicle_image_id
      }.${v.img_extension}`,
      kms: formatKm(v.odometer || v.kms),
      vehicleId: v.vehicleId || v.vehicle_id,
      imgIndex: v.imgIndex || v.vehicle_image_id,
      fuel: v.fuel,
      owner: `${
        ordinal(Number(v.owner_serial || 0)) === '0th'
          ? 'Current Owner'
          : `${ordinal(Number(v.owner_serial || 0))} Owner`
      }` as string,
      region: v.state_code || v.state_rto || v.region,
      bidding_status: v.bidding_status,
      isFavorite: v.is_favorite ?? false,
      endTime: v.end_time || v.endTime,
      manager_name: v.manager_name,
      transmissionType: v.transmissionType || v.transmission_type,
      rc_availability: v.rc_availability,
      repo_date: v.repo_date,
      regs_no: v.regs_no,
      manager_phone: v.manager_phone,
      has_bidded: v.has_bidded,
    }));
  };

  const fetchWishlist = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      const response = await wishlistService.getWishlist(page);
      const mapped = mapVehicleData(response.data);
      
      if (append) {
        setData(prev => [...prev, ...mapped]);
      } else {
        setData(mapped);
      }
      
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
      setHasMoreData(response.page < response.totalPages);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFavoriteToggle = (vehicleId: string, shouldToggle: boolean = true) => {
    if (shouldToggle) {
      setData(prevData => 
        prevData.map(vehicle => 
          vehicle.id === vehicleId 
            ? { ...vehicle, isFavorite: !vehicle.isFavorite }
            : vehicle
        )
      );
    }
  };

  const onRefresh = () => {
    setCurrentPage(1);
    setHasMoreData(true);
    fetchWishlist(1, false);
  };

  const loadMoreVehicles = useCallback(async () => {
    if (loadingMore || !hasMoreData) return;
    
    const nextPage = currentPage + 1;
    await fetchWishlist(nextPage, true);
  }, [currentPage, loadingMore, hasMoreData]);

  const handleUpdateWishlist = async (filters: FilterOptions) => {
    // Force refresh the wishlist after update
    setUpdating(true);
    setCurrentPage(1);
    setHasMoreData(true);
    try {
      await fetchWishlist(1, false);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchWishlist(1, false);
  }, []);

  // Join buyer room and subscribe to realtime updates
  useEffect(() => {
    if (buyerId != null) {
      try { socketService.setBuyerId(Number(buyerId)); } catch {}
    }
    const disposer = socketService.onVehicleWinnerUpdate(({ vehicleId, auctionEndDttm }) => {
      setData(prev => prev.map(v => {
        if (Number(v.id) !== Number(vehicleId)) return v;
        const updated: any = { ...v };
        if (auctionEndDttm) updated.endTime = normalizeAuctionEnd(auctionEndDttm);
        return updated;
      }));
    });
    const disposer2 = socketService.onIsWinning(({ vehicleId, auctionEndDttm }) => {
      setData(prev => prev.map(v => {
        if (Number(v.id) !== Number(vehicleId)) return v;
        const updated: any = { ...v };
        if (auctionEndDttm) updated.endTime = normalizeAuctionEnd(auctionEndDttm);
        return updated;
      }));
    });
    const disposer3 = socketService.onIsLosing(({ vehicleId, auctionEndDttm }) => {
      setData(prev => prev.map(v => {
        if (Number(v.id) !== Number(vehicleId)) return v;
        const updated: any = { ...v };
        if (auctionEndDttm) updated.endTime = normalizeAuctionEnd(auctionEndDttm);
        return updated;
      }));
    });
    const disposer4 = socketService.onVehicleEndtimeUpdate(({ vehicleId, auctionEndDttm }) => {
      setData(prev => prev.map(v => {
        if (Number(v.id) !== Number(vehicleId)) return v;
        return { ...v, endTime: normalizeAuctionEnd(auctionEndDttm) } as any;
      }));
    });
    return () => { disposer(); disposer2(); disposer3(); disposer4(); };
  }, [buyerId]);

  // Keep watchlist in sync if toggled elsewhere
  useEffect(() => {
    const unsubscribe = watchlistEvents.subscribe(() => {
      // Only refresh if an item likely changed; safe to refetch
      setCurrentPage(1);
      setHasMoreData(true);
      fetchWishlist(1, false);
    });
    return unsubscribe;
  }, []);

  // Listen for bid success events to refresh data
  useEffect(() => {
    const unsubscribe = bidEvents.subscribe(() => {
      setCurrentPage(1);
      setHasMoreData(true);
      fetchWishlist(1, false);
    });
    return unsubscribe;
  }, []);

  // Listen for auto-bid success events to refresh data
  useEffect(() => {
    const unsubscribe = bidEvents.subscribeAutoBid(() => {
      setCurrentPage(1);
      setHasMoreData(true);
      fetchWishlist(1, false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Header 
          type="master" 
          title="Wishlist" 
          onRightIconPress={() => setShowFilterModal(true)}
          shouldRenderRightIcon={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading wishlist...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header 
          type="master" 
          title="Wishlist" 
          onRightIconPress={() => setShowFilterModal(true)}
          shouldRenderRightIcon={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <Header 
          type="master" 
          title="Wishlist" 
          onRightIconPress={() => setShowFilterModal(true)}
          shouldRenderRightIcon={true}
          rightIcon="settings"
          rightIcon2="search"
          shouldRenderRightIcon2={true}
          onRightIconPress2={() => navigation.navigate('Search', { source: 'wishlist' })}
          onBackPress={() => navigation.goBack()}
        />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || updating}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
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
            status={item.bidding_status === 'Winning' ? 'Winning' : 'Losing'}
            isFavorite={item.isFavorite}
            endTime={item.endTime}
            manager_name={item.manager_name}
            manager_phone={item.manager_phone}
            has_bidded={item.has_bidded}
            onFavoriteToggle={handleFavoriteToggle}
          />
        )}
      />
      <FilterModal 
        visible={showFilterModal} 
        onClose={() => setShowFilterModal(false)} 
        onApply={handleUpdateWishlist}
        isWishlistMode={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: theme.spacing.veryLarge,
    backgroundColor: theme.colors.background,
  },
  list: { 
    padding: 12 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
    textAlign: 'center',
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

export default WishlistScreen;


