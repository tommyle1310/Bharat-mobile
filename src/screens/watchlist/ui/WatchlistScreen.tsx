import React, { useState, useEffect } from 'react';
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

const WatchlistScreen = () => {
  const [data, setData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatKm = (value: string | number) => {
    const num = Number(value || 0);
    return num.toLocaleString(undefined) + ' km';
  };

  const mapVehicleData = (data: any[]): Vehicle[] => {
    return (data || []).map((v: any) => ({
      id: v.vehicle_id || v.id,
      title: `${v.make} ${v.model} ${v.variant} (${v.manufacture_year})`,
      image: `${resolveBaseUrl()}/data-files/vehicles/${
        v.vehicleId || v.vehicle_id
      }/${v.imgIndex || v.vehicle_image_id}.${v.img_extension}`,
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

  const fetchWatchlist = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const watchlistData = await watchlistService.getWatchlist();
      const mapped = mapVehicleData(watchlistData);
      setData(mapped);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      setError('Failed to load watchlist');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
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
    fetchWatchlist(true);
  };

  useEffect(() => {
    fetchWatchlist();
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
        shouldRenderRightIcon={false}
        onBackPress={() => {
          /* navigation.goBack() */
        }}
        rightIcon="add"
        onRightIconPress={() => {
          /* Handle add bid */
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
      <View style={{ marginBottom: theme.spacing.veryLarge }} />
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
});

export default WatchlistScreen;
