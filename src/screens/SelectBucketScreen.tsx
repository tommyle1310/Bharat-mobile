import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import {
  vehicleServices,
  BucketApi,
  BankBucketApi,
} from '../services/vehicleServices';
import { theme } from '../theme';
import Header from '../components/Header';
import Countdown from '../components/Countdown';
import { images } from '../images';
import { EBusinessVertical } from '../types/common';
import { useUser } from '../hooks/useUser';

const renderVehicleTypeImage = (vehicleType: string) => {
  const key = vehicleType.toLowerCase().trim().replace(/\s+/g, '');
  const vehicleTypeKey = `vehicletype-${key}`;
  if (images[vehicleTypeKey]) {
    return images[vehicleTypeKey];
  }
  return images['pan']; // fallback
};

type SelectBucketRoute = RouteProp<RootStackParamList, 'SelectBucket'>;

export default function SelectBucketScreen() {
  const route = useRoute<SelectBucketRoute>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { group } = route.params || {};
  const { businessVertical } = useUser();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [buckets, setBuckets] = useState<BankBucketApi[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Check if this is being used for Bank vertical (either from user settings or route params)
  const isBankVertical = businessVertical === EBusinessVertical.BANK || !group;

  const title = group?.title || 'Bank Buckets';
  const type = group?.type || '';

  const loadBuckets = async (pageToLoad = 1) => {
    setLoading(true);
    setError(null);
    try {
      if (isBankVertical) {
        // For Bank vertical, use the new Bank buckets API
        const response = await vehicleServices.getBankBuckets(
          EBusinessVertical.BANK,
        );
        setBuckets(response.data);
        setTotalPages(response.totalPages);
        setPage(response.page);
      } else {
        // For other verticals, use the original buckets API
        const response = await vehicleServices.getBucketsByGroup({
          type,
          title,
          page: pageToLoad,
        });
        // Convert BucketApi to BankBucketApi format for consistency
        const convertedBuckets: BankBucketApi[] = response.data.map(
          (bucket: any) => ({
            bucket_id: bucket.bucket_id,
            bucket_name: bucket.bucket_name,
            bucket_end_dttm: bucket.bucket_end_dttm,
            state: bucket.state,
            vehicle_type: '', // Default empty for non-bank buckets
            vehicles_count: bucket.vehicles_count,
          }),
        );
        setBuckets(
          pageToLoad === 1
            ? convertedBuckets
            : [...buckets, ...convertedBuckets],
        );
        setTotalPages(response.totalPages);
        setPage(response.page);
      }
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

  const renderItem = ({ item }: { item: BankBucketApi }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (isBankVertical) {
            navigation.navigate('VehicleList', {
              group: {
                title: item.bucket_name,
                type: 'bucket',
                businessVertical: EBusinessVertical.BANK,
                bucketId: item.bucket_id,
              },
            });
          } else {
            navigation.navigate('VehicleList', {
              group: {
                title,
                type,
                businessVertical: group?.businessVertical,
                bucketId: item.bucket_id,
              },
            });
          }
        }}
        style={styles.card}
        activeOpacity={0.8}
      >
        <View style={styles.topRow}>
          <View style={styles.bucketInfo}>
            <Text style={styles.bucketName}>{item.bucket_name}</Text>
            <Text style={styles.stateText}>{item.state}</Text>
          </View>
          <Image
            source={renderVehicleTypeImage(item.vehicle_type)}
            style={styles.vehicleTypeImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.countText}>{item.vehicles_count}</Text>
          <View style={{ flex: 4 }}>
            <Countdown
              endTime={item.bucket_end_dttm}
              showLabels={false}
              showDays={true}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {loading && buckets.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
        </View>
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
  list: { padding: theme.spacing.md, paddingTop: 0 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: theme.colors.error },
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    ...theme.shadows.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'red',
    marginBottom: theme.spacing.md,
  },
  vehicleTypeImage: {
    width: 30,
    height: 30,
    marginRight: theme.spacing.md,
  },
  bucketInfo: {
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    // backgroundColor: 'blue',
    marginTop: -theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  bucketName: {
    color: theme.colors.info,
    fontWeight: '700',
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.bold,
  },
  stateText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.xs,
    marginTop: -theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  countText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    flex: 3,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
});
