import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import VehicleCard from '../../../components/VehicleCard';
import Header from '../../../components/Header';
import { theme } from '../../../theme';
import bidService, { BidHistoryItem } from '../../../services/bidService';
import { useUser } from '../../../hooks/useUser';
import FullScreenLoader from '../../../components/FullScreenLoader';
import { useToast } from '../../../components/Toast';

const BidsScreen = () => {
  const { buyerId } = useUser();
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      if (!buyerId) return;
      try {
        setLoading(true);
        const res = await bidService.getHistoryByBuyer(buyerId);
        // Map bid history into VehicleCard UI shape minimal
        const mapped = res.map((b) => ({
          id: String(b.vehicle_id),
          image: '',
          title: `Vehicle ${b.vehicle_id}`,
          kms: '',
          fuel: '',
          owner: (b as any).owner || '',
          region: '',
          status: b.top_bid_at_insert === 1 ? 'Winning' : 'Losing',
          isFavorite: false,
          endTime: undefined,
          manager_name: (b as any).manager_name || '',
          manager_phone: (b as any).manager_phone || '',
          has_bid: true,
          top_bid_at_insert: b.top_bid_at_insert,
        }));
        setData(mapped);
      } catch (e: any) {
        show(e?.response?.data?.message || 'Failed to load bids', 'error');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [buyerId, show]);
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
        renderItem={({ item }) => (
          <VehicleCard {...item} />
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


