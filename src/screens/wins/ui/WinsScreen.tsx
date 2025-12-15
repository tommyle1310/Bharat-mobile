import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../theme';
import { Header } from '../../../components';
import winService, {
  WinVehicle,
  AuctionStatus,
} from '../../../services/winService';
import { resolveBaseUrl } from '../../../config';
import { ordinal } from '../../../libs/function';
import { bidEvents } from '../../../services/eventBus';
import { images } from '../../../images';

const Section = ({
  title,
  color,
  onPress,
  children,
}: {
  title: string;
  color: string;
  onPress?: () => void;
  children: React.ReactNode;
}) => (
  <Pressable onPress={onPress} style={styles.card}>
    <View style={[styles.headerRow]}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{title}</Text>
      </View>
    </View>
    <View style={styles.body}>{children}</View>
  </Pressable>
);

const WinsScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedTab, setSelectedTab] = useState<AuctionStatus>(
    AuctionStatus.APPROVAL_PENDING,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<WinVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache for each tab with timestamp
  const [tabCache, setTabCache] = useState<
    Record<
      AuctionStatus,
      {
        data: WinVehicle[];
        timestamp: number;
        loading: boolean;
      }
    >
  >({} as any);

  const CACHE_DURATION = 60 * 1000; // 1 minute in milliseconds

  const tabOptions = [
    { label: 'Approval Pending', value: AuctionStatus.APPROVAL_PENDING },
    { label: 'Approved', value: AuctionStatus.APPROVED },
    { label: 'Payment Pending', value: AuctionStatus.PAYMENT_PENDING },
    { label: 'Completed', value: AuctionStatus.COMPLETED },
  ];

  const fetchWinVehicles = async (
    auctionStatus: AuctionStatus = selectedTab,
    forceRefresh: boolean = false,
  ) => {
    const now = Date.now();
    const cached = tabCache[auctionStatus];

    // Check if we have valid cached data (within 1 minute) and not forcing refresh
    if (
      !forceRefresh &&
      cached &&
      cached.data &&
      now - cached.timestamp < CACHE_DURATION
    ) {
      console.log(`Using cached data for ${auctionStatus}`);
      // Only update state if this is the currently selected tab
      if (auctionStatus === selectedTab) {
        setVehicles(cached.data);
        setLoading(false);
        setError(null);
      }
      return;
    }

    try {
      // Only set loading if this is the currently selected tab
      if (auctionStatus === selectedTab) {
        setLoading(true);
        setError(null);
      }

      const response = await winService.getWinVehicles(1, auctionStatus);
      console.log('Response data:', response.data);

      const newData = response.data.data;

      // Update cache with new data and timestamp
      setTabCache(prev => ({
        ...prev,
        [auctionStatus]: {
          data: newData,
          timestamp: now,
          loading: false,
        },
      }));

      // Only update vehicles state if this is the currently selected tab
      if (auctionStatus === selectedTab) {
        setVehicles(newData);
      }
    } catch (err) {
      console.error('Error fetching win vehicles:', err);
      console.log('Full error object:', JSON.stringify(err, null, 2));

      // Only set error if this is the currently selected tab
      if (auctionStatus === selectedTab) {
        setError('Failed to load win vehicles');
      }

      // Update cache with error state
      setTabCache(prev => ({
        ...prev,
        [auctionStatus]: {
          ...prev[auctionStatus],
          loading: false,
        },
      }));
    } finally {
      // Only set loading false if this is the currently selected tab
      if (auctionStatus === selectedTab) {
        setLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWinVehicles(selectedTab, true); // Force refresh to bypass cache
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWinVehicles();
  }, []);

  useEffect(() => {
    const cached = tabCache[selectedTab];
    const now = Date.now();

    // If no cache or cache is expired, show loading immediately
    if (!cached || !cached.data || now - cached.timestamp >= CACHE_DURATION) {
      setLoading(true);
      setVehicles([]); // Clear current vehicles to show loading
      setError(null);
    } else {
      // Use cached data immediately
      setVehicles(cached.data);
      setLoading(false);
      setError(null);
    }

    fetchWinVehicles(selectedTab);
  }, [selectedTab]); // Removed tabCache dependency to prevent infinite re-renders

  useEffect(() => {
    const unsubscribe = bidEvents.subscribe(() => {
      fetchWinVehicles(selectedTab, true); // Force refresh on bid events
    });
    return unsubscribe;
  }, [selectedTab]);

  // Listen for auto-bid success events to refresh data
  useEffect(() => {
    const unsubscribe = bidEvents.subscribeAutoBid(() => {
      fetchWinVehicles(selectedTab, true); // Force refresh on auto-bid events
    });
    return unsubscribe;
  }, [selectedTab]);

  const formatKm = (value: string | number) => {
    const num = Number(value || 0);
    return num.toLocaleString(undefined) + ' km';
  };

  // Format timestamp to display correctly - treat all timestamps as IST
  const formatTimestampInIST = (timestamp: string): string => {
    try {
      // Remove 'Z' suffix if present and treat as IST
      const cleanTimestamp = timestamp.replace('Z', '');
      const s = String(cleanTimestamp).replace('T', ' ').trim();
      const m = s.match(
        /^(\d{4})[-\/]?(\d{2}|\d{1})[-\/]?(\d{2}|\d{1})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/,
      );

      if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        const hh = Number(m[4]);
        const mm = Number(m[5]);
        const ss = m[6] ? Number(m[6]) : 0;

        // Create date directly from IST values (no timezone conversion)
        const istDate = new Date(y, mo, d, hh, mm, ss);

        return istDate
          .toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })
          .replace(',', '');
      }

      // Fallback
      return new Date(timestamp)
        .toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
        .replace(',', '');
    } catch (error) {
      // Fallback for invalid timestamps
      return new Date(timestamp)
        .toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
        .replace(',', '');
    }
  };

  const formatDate = (dateString: string) => {
    return formatTimestampInIST(dateString);
  };

  const navToDetail = (vehicle: WinVehicle) =>
    navigation.navigate('VehicleDetail', {
      vehicle: {
        id: vehicle.vehicle_id,
        title: `${vehicle.make} ${vehicle.model} ${vehicle.variant} (${vehicle.manufacture_year})`,
        image: `${resolveBaseUrl()}/data-files/vehicles/${vehicle.vehicleId}/${
          vehicle.imgIndex
        }.${vehicle.img_extension}`,
        kms: formatKm(vehicle.odometer),
        fuel: vehicle.fuel || 'N/A',
        owner:
          ordinal(Number(vehicle.owner_serial)) === '0th'
            ? 'Current Owner'
            : `${ordinal(Number(vehicle.owner_serial))} Owner`,
        region: vehicle.state_code,
        status: vehicle.bidding_status === 'Winning' ? 'Winning' : 'Losing',
        manager_name: vehicle.manager_name,
        manager_phone: vehicle.manager_phone,
        transmissionType: vehicle.transmissionType,
        rc_availability: vehicle.rc_availability,
        repo_date: vehicle.repo_date,
        regs_no: vehicle.regs_no,
        has_bidded: vehicle.has_bidded,
        isFavorite: vehicle.is_favorite,
        endTime: vehicle.end_time,
        bidding_status: vehicle.bidding_status,
      },
    });

  return (
    <View style={styles.container}>
      <Header
        type="master"
        title="Wins"
        shouldRenderRightIcon={false}
        onBackPress={() => {
          /* navigation.goBack() */
        }}
        rightIcon="add"
        onRightIconPress={() => {
          /* Handle add bid */
        }}
      />
      <View style={styles.tabContainer}>
        {tabOptions.map(tab => (
          <Pressable
            key={tab.value}
            style={[
              styles.tabItem,
              selectedTab === tab.value && styles.tabItemActive,
            ]}
            onPress={() => {
              console.log('Tab changed to:', tab.value);
              setSelectedTab(tab.value);
            }}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.value && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={vehicles}
        renderItem={({ item: vehicle }) => {
          const getSectionTitle = () => {
            switch (selectedTab) {
              case AuctionStatus.APPROVAL_PENDING:
                return 'Approval Pending';
              case AuctionStatus.APPROVED:
                return 'Approved';
              case AuctionStatus.PAYMENT_PENDING:
                return 'Payment Pending';
              case AuctionStatus.COMPLETED:
                return 'Completed';
              default:
                return 'Approval Pending';
            }
          };

          const getSectionColor = () => {
            switch (selectedTab) {
              case AuctionStatus.APPROVAL_PENDING:
                return theme.colors.warning;
              case AuctionStatus.APPROVED:
                return theme.colors.success;
              case AuctionStatus.PAYMENT_PENDING:
                return theme.colors.info;
              case AuctionStatus.COMPLETED:
                return theme.colors.primary;
              default:
                return theme.colors.warning;
            }
          };

          return (
            <Section
              title={getSectionTitle()}
              color={getSectionColor()}
              onPress={() => navToDetail(vehicle)}
            >
              <Image
                source={{
                  uri: `${resolveBaseUrl()}/data-files/vehicles/${
                    vehicle.vehicleId
                  }/${vehicle.imgIndex}.${vehicle.img_extension}`,
                }}
                style={styles.media}
                defaultSource={images.logo}
                onError={() => {
                  console.log('Failed to load vehicle image');
                }}
              />
              <Text style={styles.lineTitle}>
                {vehicle.make} {vehicle.model} {vehicle.variant} (
                {vehicle.manufacture_year})
              </Text>
              <View style={styles.regs_no_row}>
                <Text>Regs No.</Text>
                <Text style={{ color: theme.colors.text, fontWeight: 600 }}>
                  {vehicle.regs_no}
                </Text>
              </View>
              <View style={styles.bid_details_row}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.xs,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.textMuted,
                      fontSize: theme.fontSizes.xs,
                    }}
                  >
                    Bid date:
                  </Text>
                  <Text
                    style={{
                      color: theme.colors.text,
                      fontSize: theme.fontSizes.xs,
                    }}
                  >
                    {formatDate(vehicle.end_time)}
                  </Text>
                </View>
                <Text>{Number(vehicle.bid_amount).toLocaleString()}/-</Text>
              </View>
              {vehicle.manager_phone ||
                (vehicle.manager_name && (
                  <View style={styles.contact_row}>
                    <Text style={styles.contact_row}>
                      {vehicle.manager_name}
                    </Text>
                    <Text>-</Text>
                    <TouchableOpacity
                      onPress={() => {
                        Linking.openURL(`tel:${vehicle.manager_phone}`);
                      }}
                    >
                      <Text
                        style={{
                          ...styles.contact_row,
                          textDecorationLine: 'underline',
                        }}
                      >
                        {vehicle.manager_phone}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </Section>
          );
        }}
        keyExtractor={item => item.vehicle_id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={() => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading win vehicles...</Text>
              </View>
            );
          }

          if (error) {
            return (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            );
          }

          return (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No win vehicles found</Text>
            </View>
          );
        }}
      />
      <View
        style={{
          paddingBottom: theme.spacing.veryLarge,
        }}
      ></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabScrollContent: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  tabItem: {
    flex: 1,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    borderTopLeftRadius: theme.radii.md,
    borderTopRightRadius: theme.radii.md,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.fontSizes.xs,
    fontWeight: '600',
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  tabTextActive: {
    color: theme.colors.textInverse,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  card: {
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    ...theme.shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    borderBottomRightRadius: theme.radii.lg,
    marginBottom: theme.spacing.md,
  },
  badgeText: {
    color: theme.colors.textInverse,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
  },
  body: {
    paddingHorizontal: theme.spacing.xs,
  },
  media: {
    width: '100%',
    height: 150,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
  },
  lineTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  bid_details_row: {
    fontSize: theme.fontSizes.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    display: 'flex',
    // marginBottom: theme.spacing.xs,
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  contact_row: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.info,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    gap: theme.spacing.sm,
    // marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  regs_no_row: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
    textAlign: 'center',
  },
});

export default WinsScreen;
