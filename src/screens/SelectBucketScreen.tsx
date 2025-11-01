import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { vehicleServices, BucketApi } from '../services/vehicleServices';
import { theme } from '../theme';
import Header from '../components/Header';
import Countdown from '../components/Countdown';

type SelectBucketRoute = RouteProp<RootStackParamList, 'SelectBucket'>;

export default function SelectBucketScreen() {
  const route = useRoute<SelectBucketRoute>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { group } = route.params || {};

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [buckets, setBuckets] = useState<BucketApi[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);

  const title = group?.title || '';
  const type = group?.type || '';

  const loadBuckets = async (pageToLoad = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await vehicleServices.getBucketsByGroup({ type, title, page: pageToLoad });
      setBuckets(pageToLoad === 1 ? response.data : [...buckets, ...response.data]);
      setTotalPages(response.totalPages);
      setPage(response.page);
    } catch (e: any) {
      setError(e?.message || 'Failed to load buckets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuckets(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, type]);

  const onEndReached = () => {
    if (!loading && page < totalPages) {
      loadBuckets(page + 1);
    }
  };

  const renderItem = ({ item }: { item: BucketApi }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('VehicleList', {
            group: {
              title,
              type,
              businessVertical: group?.businessVertical,
              bucketId: item.bucket_id,
            },
          });
        }}
        style={styles.card}
        activeOpacity={0.8}
      >
        <Countdown endTime={item.bucket_end_dttm} showLabels={false} showDays={true} />
        <View style={styles.cardBody}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bucketName}>{item.bucket_name}</Text>
            <Text style={styles.stateText}>{item.state}</Text>
          </View>
          <Text style={styles.countText}>{item.vehicles_count}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        type="search"
        canGoBack={true}
        onBackPress={() => (navigation as any).goBack()}
        onFilterPress={() => {}}
        title="Select Bucket"
        shouldRenderRightIcon={false}
      />
      {loading && buckets.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.error}>{error}</Text></View>
      ) : (
        <FlatList
          data={buckets}
          keyExtractor={b => `${b.bucket_id}`}
          renderItem={renderItem}
          onEndReached={onEndReached}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: theme.spacing.md },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: theme.colors.error },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  },
  cardBody: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.md },
  bucketName: { color: theme.colors.text, fontWeight: '700', fontSize: theme.fontSizes.md, fontFamily: theme.fonts.bold },
  stateText: { color: theme.colors.textMuted, marginTop: theme.spacing.xs, fontFamily: theme.fonts.regular },
  countText: { fontSize: theme.fontSizes.xl, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.bold },
});


