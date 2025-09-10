import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import VehicleCard from '../../../components/VehicleCard';
import Header from '../../../components/Header';
import { theme } from '../../../theme';
import bidService, { BidHistoryItem } from '../../../services/bidService';
import { useUser } from '../../../hooks/useUser';
import FullScreenLoader from '../../../components/FullScreenLoader';
import { useToast } from '../../../components/Toast';
import { ordinal } from '../../../libs/function';
import { resolveBaseUrl } from '../../../config';

function formatKm(value: string | number) {
  const num = Number(value || 0);
  return num.toLocaleString(undefined) + ' km';
}

const BidsScreen = () => {
  const { buyerId } = useUser();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!buyerId) return;
    try {
      setLoading(true);
      const res = await bidService.getHistoryByBuyer(buyerId);
      const mapped = res.map((b: any) => ({
          id: String(b.vehicle_id),
          title: `${b.make} ${b.model} ${b.variant} (${b.manufacture_year})`,
          image: `${resolveBaseUrl()}/data-files/vehicles/${b.vehicleId}/${b.imgIndex}.${b.img_extension}`,
          kms: formatKm(b.odometer),
          fuel: b.fuel,
          owner: `${
            ordinal(Number(b.owner_serial)) === '0th'
              ? 'Current Owner'
              : `${ordinal(Number(b.owner_serial))} Owner`
          }`,
          region: b.state_code || b.state_rto,
          status: b.bidding_status || (b.has_bidded ? 'Winning' : 'Losing'),
          isFavorite: b.is_favorite ?? false,
          endTime: b.end_time,
          manager_name: b.manager_name || '',
          manager_phone: b.manager_phone || '',
          has_bidded: b.has_bidded ?? false,
        }));
      setData(mapped);
    } catch (e: any) {
      show(e?.response?.data?.message || 'Failed to load bids', 'error');
    } finally {
      setLoading(false);
    }
  }, [buyerId, show]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);
  return (
    <View style={styles.container}>
      <Header 
        type="master" 
        title="My Bids" 
        onBackPress={() => {/* navigation.goBack() */}}
        rightIcon="add"
        onRightIconPress={() => {/* Handle add bid */}}
      />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <VehicleCard 
            {...item} 
            onBidSuccess={() => {
              // Refetch bid history when bid is successful
              fetchData();
            }}
          />
        )}
      />
      <FullScreenLoader visible={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: { 
    padding: theme.spacing.md 
  }
});

export default BidsScreen;


