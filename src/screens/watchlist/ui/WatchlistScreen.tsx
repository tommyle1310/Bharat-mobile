import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
  RefreshControl,
} from 'react-native';
import VehicleCard from '../../../components/VehicleCard';
import { watchlistService } from '../../../services/watchlistService';
import { Header } from '../../../components';
import { theme } from '../../../theme';
import { Vehicle } from '../../../types/Vehicle';
import { resolveBaseUrl } from '../../../config';
import { ordinal } from '../../../libs/function';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { watchlistEvents, bidEvents } from '../../../services/eventBus';
import { socketService, normalizeAuctionEnd } from '../../../services/socket';
import { useUser } from '../../../hooks/useUser';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WatchlistScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { buyerId } = useUser();
  const [data, setData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const formatKm = (value: string | number) => {
    const num = Number(value || 0);
    return num.toLocaleString(undefined) + ' km';
  };

  const mapVehicleData = (data: any[]): Vehicle[] => {
    return (data || []).map((v: any) => {
      const ownerSerialNum = Number(v.owner_serial);
      const ownerStr =
        !Number.isFinite(ownerSerialNum) || ownerSerialNum <= 0
          ? '-'
          : ordinal(ownerSerialNum) === '0th'
          ? 'Current Owner'
          : `${ordinal(ownerSerialNum)} Owner`;
      const title = `${v.make || '-'} ${v.model || '-'} ${v.variant || '-'} (${
        v.manufacture_year || '-'
      })`;
      return {
        id:
          (v.vehicle_id || v.id)?.toString?.() || String(v.vehicle_id || v.id),
        title,
        image: `${resolveBaseUrl()}/data-files/vehicles/${
          v.vehicleId || v.vehicle_id
        }/${v.imgIndex || v.vehicle_image_id}.${v.img_extension}`,
        kms: formatKm(v.odometer || v.kms),
        vehicleId: v.vehicleId || v.vehicle_id,
        imgIndex: v.imgIndex || v.vehicle_image_id,
        fuel: v.fuel || '-',
        owner: ownerStr as string,
        region: v.state_code || v.state_rto || v.region || '-',
        bidding_status: v.bidding_status,
        isFavorite: v.is_favorite ?? false,
        endTime: v.end_time || v.endTime,
        manager_name: v.manager_name || '-',
        transmissionType: v.transmissionType || v.transmission_type || '-',
        rc_availability: v.rc_availability,
        repo_date: v.repo_date,
        regs_no: v.regs_no || '-',
        manager_phone: v.manager_phone || '-',
        has_bidded: v.has_bidded,
      } as Vehicle;
    });
  };

  const fetchWatchlist = async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      const response = await watchlistService.getWatchlist(page);
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
      console.error('Error fetching watchlist:', err);
      setError('Failed to load watchlist');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFavoriteToggle = (
    vehicleId: string,
    shouldToggle: boolean = true,
  ) => {
    if (shouldToggle) {
      setData(prevData =>
        prevData.map(vehicle =>
          vehicle.id === vehicleId
            ? { ...vehicle, isFavorite: !vehicle.isFavorite }
            : vehicle,
        ),
      );
    }
  };

  const onRefresh = () => {
    setCurrentPage(1);
    setHasMoreData(true);
    fetchWatchlist(1, false);
  };

  const loadMoreVehicles = useCallback(async () => {
    if (loadingMore || !hasMoreData) return;

    const nextPage = currentPage + 1;
    await fetchWatchlist(nextPage, true);
  }, [currentPage, loadingMore, hasMoreData]);

  useEffect(() => {
    fetchWatchlist(1, false);
  }, []);

  // Join buyer room and subscribe to realtime updates
  useEffect(() => {
    if (buyerId != null) {
      try {
        socketService.setBuyerId(Number(buyerId));
      } catch {}
    }
    const disposer = socketService.onVehicleWinnerUpdate(
      ({ vehicleId, winnerBuyerId, loserBuyerId, auctionEndDttm }) => {
        setData(prev =>
          prev.map(v => {
            if (Number(v.id) !== Number(vehicleId)) return v;
            let status = v.bidding_status as any;
            // We cannot know my buyerId in this screen without useUser; leave status untouched
            const updated: any = { ...v, bidding_status: status };
            if (auctionEndDttm)
              updated.endTime = normalizeAuctionEnd(auctionEndDttm);
            return updated;
          }),
        );
      },
    );
    const disposer2 = socketService.onIsWinning(
      ({ vehicleId, auctionEndDttm }) => {
        setData(prev =>
          prev.map(v => {
            if (Number(v.id) !== Number(vehicleId)) return v;
            const updated: any = {
              ...v,
              has_bidded: true as any,
              bidding_status: 'Winning' as any,
            };
            if (auctionEndDttm)
              updated.endTime = normalizeAuctionEnd(auctionEndDttm);
            return updated;
          }),
        );
      },
    );
    const disposer3 = socketService.onIsLosing(
      ({ vehicleId, auctionEndDttm }) => {
        setData(prev =>
          prev.map(v => {
            if (Number(v.id) !== Number(vehicleId)) return v;
            const updated: any = {
              ...v,
              has_bidded: true as any,
              bidding_status: 'Losing' as any,
            };
            if (auctionEndDttm)
              updated.endTime = normalizeAuctionEnd(auctionEndDttm);
            return updated;
          }),
        );
      },
    );
    const disposer4 = socketService.onVehicleEndtimeUpdate(
      ({ vehicleId, auctionEndDttm }) => {
        setData(prev =>
          prev.map(v => {
            if (Number(v.id) !== Number(vehicleId)) return v;
            return {
              ...v,
              endTime: normalizeAuctionEnd(auctionEndDttm),
            } as any;
          }),
        );
      },
    );
    return () => {
      disposer();
      disposer2();
      disposer3();
      disposer4();
    };
  }, [buyerId]);

  // Force refresh when any card toggles favorite anywhere in the app
  useEffect(() => {
    const unsubscribe = watchlistEvents.subscribe(() => {
      setCurrentPage(1);
      setHasMoreData(true);
      fetchWatchlist(1, false);
    });
    return unsubscribe;
  }, []);

  // Listen for bid success events to refresh data
  useEffect(() => {
    const unsubscribe = bidEvents.subscribe(() => {
      setCurrentPage(1);
      setHasMoreData(true);
      fetchWatchlist(1, false);
    });
    return unsubscribe;
  }, []);

  // Listen for auto-bid success events to refresh data
  useEffect(() => {
    const unsubscribe = bidEvents.subscribeAutoBid(() => {
      setCurrentPage(1);
      setHasMoreData(true);
      fetchWatchlist(1, false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <>
        <Header
          type="master"
          title="My Watchlist"
          shouldRenderRightIcon={false}
          onBackPress={() => {
            /* navigation.goBack() */
          }}
          rightIcon="add"
          onRightIconPress={() => {
            /* Handle add bid */
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading watchlist...</Text>
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          type="master"
          title="My Watchlist"
          shouldRenderRightIcon={false}
          onBackPress={() => {
            /* navigation.goBack() */
          }}
          rightIcon="add"
          onRightIconPress={() => {
            /* Handle add bid */
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Header
        type="master"
        title="My Watchlist"
        shouldRenderRightIcon={true}
        onBackPress={() => {
          /* navigation.goBack() */
        }}
        rightIcon="search"
        onRightIconPress={() => {
          navigation.navigate('Search', { source: 'watchlist' });
        }}
      />
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
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
              <Text style={styles.loadingMoreText}>
                Loading more vehicles...
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => {
          if (index === data.length - 1) {
            return <View style={{ marginBottom: theme.spacing.veryLarge }} />;
          }
          return (
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
          );
        }}
      />
      {/* <View style={{ marginBottom: theme.spacing.veryLarge }} /> */}
    </>
  );
};

const styles = StyleSheet.create({
  list: { padding: 12 },
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

export default WatchlistScreen;
