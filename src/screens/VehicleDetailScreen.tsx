import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  Image,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  TextInput,
  TouchableOpacity,
  Linking,
  FlatList,
  Animated,
  Easing,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Modal from '../components/Modal';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { theme } from '../theme';
import { Vehicle } from '../types/Vehicle';
import Badge from '../components/Badge';
import Header from '../components/Header';
import { Button } from '../components';
import bidService, {
  BidHistoryItem,
  AutoBidData,
} from '../services/bidService';
import { useUser } from '../hooks/useUser';
import FullScreenLoader from '../components/FullScreenLoader';
import { useToast } from '../components/Toast';
import { vehicleServices } from '../services/vehicleServices';
import { ordinal } from '../libs/function';
import { resolveBaseUrl } from '../config';
import { socketService, normalizeAuctionEnd } from '../services/socket';
import watchlistService from '../services/watchlistService';
import { errorHandlers } from '../utils/errorHandlers';
import { images } from '../images';

type Params = { vehicle?: Vehicle; id?: string };

function formatKm(value: string | number) {
  const num = Number(value || 0);
  return num.toLocaleString(undefined) + ' km';
}

export default function VehicleDetailScreen() {
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const navigation = useNavigation<any>();
  const [vehicle, setVehicle] = useState<Vehicle | undefined>(
    (route.params as Params)?.vehicle as Vehicle | undefined,
  );
  
  // Debug logging
  console.log('VehicleDetailScreen: Vehicle data received:', vehicle);
  console.log('VehicleDetailScreen: Vehicle id:', vehicle?.id);
  console.log('VehicleDetailScreen: Route params:', route.params);
  
  if (!vehicle) return null;
  const { buyerId } = useUser();
  const { show } = useToast();
  // Interpret naive end time strings as IST (Asia/Kolkata)
  function getIstEndMs(end?: string) {
    if (!end) return Date.now();
    try {
      const s = String(end).replace('T', ' ').trim();
      const m = s.match(/^(\d{4})[-\/]?(\d{2}|\d{1})[-\/]?(\d{2}|\d{1})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (m) {
        const y = Number(m[1]);
        const mo = Number(m[2]) - 1;
        const d = Number(m[3]);
        const hh = Number(m[4]);
        const mm = Number(m[5]);
        const ss = m[6] ? Number(m[6]) : 0;
        // Convert IST (UTC+05:30) naive timestamp to UTC epoch
        return Date.UTC(y, mo, d, hh - 5, mm - 30, ss);
      }
      // Fallback for ISO strings with timezone info
      return new Date(end).getTime();
    } catch {
      return new Date(end).getTime();
    }
  }
  const [remaining, setRemaining] = useState<number>(() =>
    vehicle.endTime
      ? Math.max(
          0,
          Math.floor((getIstEndMs(vehicle.endTime) - Date.now()) / 1000),
        )
      : 0,
  );

  useEffect(() => {
    if (!vehicle.endTime) return;
    const id = setInterval(() => {
      const end = getIstEndMs(vehicle.endTime as string);
      setRemaining(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [vehicle.endTime]);

  const ddhhmmss = useMemo(() => {
    let s = remaining;
    const days = Math.floor(s / 86400);
    s -= days * 86400;
    const hours = Math.floor(s / 3600);
    s -= hours * 3600;
    const minutes = Math.floor(s / 60);
    s -= minutes * 60;
    const seconds = s;
    const pad = (n: number) => String(n).padStart(2, '0');
    return [days, pad(hours), pad(minutes), pad(seconds)] as [
      number,
      string,
      string,
      string,
    ];
  }, [remaining]);

  const [autoBidOpen, setAutoBidOpen] = useState(false);
  const [manualBidOpen, setManualBidOpen] = useState(false);
  const [startAmount, setStartAmount] = useState('');
  const [stepAmount, setStepAmount] = useState('');
  const [maxBid, setMaxBid] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [history, setHistory] = useState<BidHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoBidData, setAutoBidData] = useState<AutoBidData | null>(null);
  const [autoBidLoading, setAutoBidLoading] = useState(false);
  const [limitsLoading, setLimitsLoading] = useState(false);
  const [buyerLimits, setBuyerLimits] = useState<import('../services/bidService').BuyerLimits | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const settingsSpinAnim = React.useRef(new Animated.Value(0)).current;
  const settingsSpinLoopRef = React.useRef<Animated.CompositeAnimation | null>(
    null,
  );
  const spinOnce = useCallback(() => {
    settingsSpinAnim.setValue(0);
    Animated.timing(settingsSpinAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [settingsSpinAnim]);
  const settingsSpin = settingsSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (autoBidData) {
      settingsSpinAnim.setValue(0);
      const loop = Animated.loop(
        Animated.timing(settingsSpinAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      settingsSpinLoopRef.current = loop;
      loop.start();
    } else {
      settingsSpinLoopRef.current?.stop();
      settingsSpinLoopRef.current = null;
      settingsSpinAnim.setValue(0);
    }
  }, [autoBidData, settingsSpinAnim]);
  const securityDeposit = 20000;
  const bidLimit = 200000;
  const limitUsed = 178000;
  const pendingLimit = bidLimit - limitUsed;

  const refetchVehicleData = async () => {
    if (!vehicle?.id) return;
    try {
      const freshVehicleData = await vehicleServices.getVehicleById(
        Number(vehicle.id),
      );
      // Map the API response to Vehicle type
      const mappedVehicle: Vehicle = {
        id: freshVehicleData.vehicle_id,
        title: `${freshVehicleData.make} ${freshVehicleData.model} ${freshVehicleData.variant} (${freshVehicleData.manufacture_year})`,
        image: `${resolveBaseUrl()}/data-files/vehicles/${
          freshVehicleData.vehicleId
        }/${freshVehicleData.imgIndex}.${freshVehicleData.img_extension}`,
        kms: formatKm(freshVehicleData.odometer),
        fuel: freshVehicleData.fuel,
        owner: `${
          ordinal(Number(freshVehicleData.owner_serial)) === '0th'
            ? 'Current Owner'
            : `${ordinal(Number(freshVehicleData.owner_serial))} Owner`
        }`,
        region: freshVehicleData.state_rto,
        status: freshVehicleData.status,
        isFavorite: freshVehicleData.is_favorite ?? false,
        endTime: freshVehicleData.end_time,
        manager_name: freshVehicleData.manager_name,
        manager_phone: freshVehicleData.manager_phone,
        has_bidded: freshVehicleData.has_bidded,
        transmissionType: freshVehicleData.transmissionType,
        rc_availability: freshVehicleData.rc_availability,
        repo_date: freshVehicleData.repo_date,
        regs_no: freshVehicleData.regs_no,
        bidding_status: freshVehicleData.bidding_status,
        yard_contact_person_name: freshVehicleData.yard_contact_person_name,
        contact_person_contact_no: freshVehicleData.contact_person_contact_no,
        yard_address: freshVehicleData.yard_address,
        yard_address_zip: freshVehicleData.yard_address_zip,
        yard_city: freshVehicleData.yard_city,
        yard_state: freshVehicleData.yard_state,
      };
      setVehicle(mappedVehicle);
    } catch (error) {
      console.error('Failed to refetch vehicle data:', error);
    }
  };
  const loadAutoBidData = useCallback(async () => {
    console.log('loadAutoBidData called with vehicle.id:', vehicle?.id);
    if (!vehicle?.id) {
      console.log('loadAutoBidData: Early return - vehicle.id missing');
      return;
    }
    try {
      console.log('loadAutoBidData: Making API call...');
      setAutoBidLoading(true);
      const response = await bidService.getAutoBid(Number(vehicle.id));

      if ('message' in response && response.message === 'Auto bid not found') {
        setAutoBidData(null);
        // Clear form fields when no auto-bid exists
        setStartAmount('');
        setStepAmount('');
        setMaxBid('');
      } else {
        const autoBid = response as AutoBidData;
        setAutoBidData(autoBid);
        // Populate form fields with existing auto-bid data
        setStartAmount(autoBid.bid_start_amt.toString());
        setStepAmount(autoBid.step_amt.toString());
        setMaxBid(autoBid.max_bid_amt.toString());
      }
    } catch (e: any) {
      console.error('Failed to load auto-bid data:', e);
      setAutoBidData(null);
      setStartAmount('');
      setStepAmount('');
      setMaxBid('');
    } finally {
      setAutoBidLoading(false);
    }
  }, [vehicle?.id]);
  const loadHistory = useCallback(async (page: number = 1, append: boolean = false) => {
    console.log('loadHistory called with buyerId:', buyerId, 'vehicle.id:', vehicle?.id, 'page:', page);
    if (!buyerId || !vehicle?.id) {
      console.log('loadHistory: Early return - buyerId or vehicle.id missing');
      return;
    }
    try {
      console.log('loadHistory: Making API calls for vehicle ID:', vehicle.id);
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMoreHistory(true);
      }
      
      // Fetch both bid history and fresh vehicle data
      const [historyResponse, freshVehicleData] = await Promise.all([
        bidService.getHistoryByVehicle(buyerId, Number(vehicle.id), page),
        vehicleServices.getVehicleById(Number(vehicle.id)),
      ]);
      
      console.log('loadHistory: API calls completed, items count:', historyResponse.data?.length);

      if (append) {
        setHistory(prev => [...prev, ...historyResponse.data]);
      } else {
        setHistory(historyResponse.data);
      }
      
      setHistoryCurrentPage(historyResponse.page);
      setHistoryTotalPages(historyResponse.totalPages);
      setHasMoreHistory(historyResponse.page < historyResponse.totalPages);

      // Update vehicle data with fresh data from API
      const mappedVehicle: Vehicle = {
        id: freshVehicleData.vehicle_id,
        title: `${freshVehicleData.make} ${freshVehicleData.model} ${freshVehicleData.variant} (${freshVehicleData.manufacture_year})`,
        image: `${resolveBaseUrl()}/data-files/vehicles/${
          freshVehicleData.vehicleId
        }/${freshVehicleData.imgIndex}.${freshVehicleData.img_extension}`,
        kms: formatKm(freshVehicleData.odometer),
        fuel: freshVehicleData.fuel,
        owner: `${
          ordinal(Number(freshVehicleData.owner_serial)) === '0th'
            ? 'Current Owner'
            : `${ordinal(Number(freshVehicleData.owner_serial))} Owner`
        }`,
        region: freshVehicleData.state_rto,
        status: freshVehicleData.status,
        isFavorite: freshVehicleData.is_favorite ?? false,
        endTime: freshVehicleData.end_time,
        manager_name: freshVehicleData.manager_name,
        manager_phone: freshVehicleData.manager_phone,
        has_bidded: freshVehicleData.has_bidded,
        bidding_status: freshVehicleData.bidding_status,
        transmissionType: freshVehicleData.transmissionType,
        rc_availability: freshVehicleData.rc_availability,
        repo_date: freshVehicleData.repo_date,
        regs_no: freshVehicleData.regs_no,
        yard_contact_person_name: freshVehicleData.yard_contact_person_name,
        contact_person_contact_no: freshVehicleData.contact_person_contact_no,
        yard_address: freshVehicleData.yard_address,
        yard_address_zip: freshVehicleData.yard_address_zip,
        yard_city: freshVehicleData.yard_city,
        yard_state: freshVehicleData.yard_state,
      };
      setVehicle(mappedVehicle);
    } catch (e: any) {
      show(e?.response?.data?.message || 'Failed to load bid history', 'error');
    } finally {
      setLoading(false);
      setLoadingMoreHistory(false);
    }
  }, [buyerId, vehicle?.id, show]);

  // Single effect to load data when component mounts or when buyerId/vehicle changes
  useEffect(() => {
    if (!vehicle?.id) return;
    
    console.log('VehicleDetailScreen: Effect triggered for vehicle:', vehicle.id, 'buyerId:', buyerId);
    
    const loadData = async () => {
      if (buyerId) {
        console.log('VehicleDetailScreen: buyerId available, loading data');
        setHistoryCurrentPage(1);
        setHasMoreHistory(true);
        await Promise.all([loadHistory(1, false), loadAutoBidData()]).catch(() => {});
      } else {
        console.log('VehicleDetailScreen: buyerId not available, will retry when available');
      }
    };
    
    // If buyerId is available, load immediately
    if (buyerId) {
      loadData();
    } else {
      // If buyerId is not available, wait a bit and try again
      const timer = setTimeout(() => {
        if (buyerId) {
          console.log('VehicleDetailScreen: buyerId available after delay, loading data');
          loadData();
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [buyerId, vehicle?.id]);

  // Join buyer room when buyerId available
  useEffect(() => {
    if (buyerId != null) {
      try {
        socketService.setBuyerId(Number(buyerId));
      } catch {}
    }
  }, [buyerId]);

  // Subscribe to realtime events for this vehicle
  useEffect(() => {
    if (!vehicle?.id) return;
    const disposers: Array<() => void> = [];

    disposers.push(
      socketService.onIsWinning(({ vehicleId }) => {
        if (Number(vehicleId) !== Number(vehicle.id)) return;
        setVehicle(prev =>
          prev
            ? {
                ...prev,
                has_bidded: true as any,
                bidding_status: 'Winning' as any,
              }
            : prev,
        );
        // Force refresh bid history when winning status changes
        setHistoryCurrentPage(1);
        setHasMoreHistory(true);
        loadHistory(1, false);
      }),
    );

    disposers.push(
      socketService.onIsLosing(({ vehicleId }) => {
        if (Number(vehicleId) !== Number(vehicle.id)) return;
        setVehicle(prev =>
          prev
            ? {
                ...prev,
                has_bidded: true as any,
                bidding_status: 'Losing' as any,
              }
            : prev,
        );
        // Force refresh bid history when losing status changes
        setHistoryCurrentPage(1);
        setHasMoreHistory(true);
        loadHistory(1, false);
      }),
    );

    disposers.push(
      socketService.onVehicleEndtimeUpdate(({ vehicleId, auctionEndDttm }) => {
        if (Number(vehicleId) !== Number(vehicle.id)) return;
        setVehicle(prev =>
          prev
            ? { ...prev, endTime: normalizeAuctionEnd(auctionEndDttm) }
            : prev,
        );
      }),
    );

    disposers.push(
      socketService.onVehicleWinnerUpdate(
        ({ vehicleId, winnerBuyerId, loserBuyerId, auctionEndDttm }) => {
          if (Number(vehicleId) !== Number(vehicle?.id)) return;
          const myId = buyerId != null ? Number(buyerId) : null;
          setVehicle(prev => {
            if (!prev) return prev as any;
            let status = prev.bidding_status as any;
            if (myId && winnerBuyerId === myId) status = 'Winning';
            else if (myId && loserBuyerId === myId) status = 'Losing';
            const updated: any = { ...prev, bidding_status: status };
            if (auctionEndDttm) {
              updated.endTime = normalizeAuctionEnd(auctionEndDttm);
            }
            return updated;
          });
          // Force refresh bid history when winner update is received
          setHistoryCurrentPage(1);
          setHasMoreHistory(true);
          loadHistory(1, false);
        },
      ),
    );

    return () => {
      disposers.forEach(d => d());
    };
  }, [vehicle?.id, buyerId]);

  const placeBid = async () => {
    if (!buyerId) {
      show('Not authenticated', 'error');
      return;
    }
    const amt = Number(bidAmount);
    if (!amt || amt <= 0) {
      show('Enter a valid bid amount', 'error');
      return;
    }
    try {
      setLoading(true);
      const res = await bidService.placeManualBid({
        buyer_id: buyerId,
        vehicle_id: Number(vehicle.id),
        bid_amount: amt,
      });
      show(res?.message || 'Bid placed successfully', 'success');
      setBidAmount('');
      setManualBidOpen(false);
      // Refetch both vehicle data and bid history
      setHistoryCurrentPage(1);
      setHasMoreHistory(true);
      await Promise.all([refetchVehicleData(), loadHistory(1, false)]);
    } catch (e: any) {
      console.log('e', e.response.data);
      show(errorHandlers(e.response.data.message), 'error');
    } finally {
      setLoading(false);
      setAutoBidOpen(false);
      setManualBidOpen(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setHistoryCurrentPage(1);
    setHasMoreHistory(true);
    try {
      await Promise.all([
        loadHistory(1, false),
        loadAutoBidData(),
        refetchVehicleData(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [loadHistory, loadAutoBidData]);

  const loadMoreHistory = useCallback(async () => {
    if (loadingMoreHistory || !hasMoreHistory) return;
    
    const nextPage = historyCurrentPage + 1;
    await loadHistory(nextPage, true);
  }, [historyCurrentPage, loadingMoreHistory, hasMoreHistory, loadHistory]);

  const saveAutoBid = async () => {
    if (!buyerId) {
      show('Not authenticated', 'error');
      return;
    }
    const start = Number(startAmount);
    const step = Number(stepAmount);
    const max = Number(maxBid);
    if (!start || !step || !max) {
      show('Fill all auto-bid amounts', 'error');
      return;
    }
    try {
      setLoading(true);

      const payload = {
        buyer_id: buyerId,
        vehicle_id: Number(vehicle.id),
        start_amount: start,
        max_bid: max,
        step_amount: step,
      };

      let res;
      if (autoBidData) {
        // Update existing auto-bid
        res = await bidService.updateAutoBid(Number(vehicle.id), payload);
      } else {
        // Create new auto-bid
        res = await bidService.setAutoBid(payload);
      }

      show(res?.message || 'Auto-bid saved', 'success');
      setAutoBidOpen(false);
      // Refetch vehicle data after auto-bid setup
      await refetchVehicleData();
    } catch (e: any) {
      show('You cannot save auto-bid on this vehicle', 'error');
    } finally {
      setLoading(false);
      setAutoBidOpen(false);
    }
  };

  const deleteAutoBid = async () => {
    if (!vehicle?.id || !autoBidData) return;
    try {
      setLoading(true);
      const res = await bidService.deleteAutoBid(Number(vehicle.id));
      show(res?.message || 'Auto-bid deleted', 'success');
      setAutoBidOpen(false);
      setAutoBidData(null);
      // Clear form fields
      setStartAmount('');
      setStepAmount('');
      setMaxBid('');
      // Refetch vehicle data after auto-bid deletion
      await refetchVehicleData();
    } catch (e: any) {
      show(e?.response?.data?.message || 'Failed to delete auto-bid', 'error');
    } finally {
      setLoading(false);
      setAutoBidOpen(false);
    }
  };

  useEffect(() => {
    const fetchLimits = async () => {
      if (!(autoBidOpen || manualBidOpen) || !buyerId) return;
      try {
        setLimitsLoading(true);
        const limits = await bidService.getBuyerLimits(Number(buyerId));
        setBuyerLimits(limits);
      } catch (e) {
        setBuyerLimits(null);
      } finally {
        setLimitsLoading(false);
      }
    };
    fetchLimits();
  }, [autoBidOpen, manualBidOpen, buyerId]);

  const shouldShowBadge = vehicle?.has_bidded !== false;
  const badgeStatus =
    vehicle?.bidding_status ||
    vehicle?.status ||
    (vehicle?.has_bidded ? 'Winning' : 'Losing');
  return (
    <View style={styles.container}>
      <Header
        type="master"
        canGoBack
        title="Vehicle Details"
        onBackPress={() => navigation.goBack()}
        rightIcon="info"
        // onRightIconPress={() => setAutoBidOpen(true)}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={({ nativeEvent }) => {
          try {
            const paddingToBottom = 120;
            const reachedEnd =
              nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
              nativeEvent.contentSize.height - paddingToBottom;
            if (reachedEnd) {
              loadMoreHistory();
            }
          } catch {}
        }}
        scrollEventThrottle={250}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Vehicle Details Card */}
        <View style={styles.card}>
          <View style={styles.countdownRow} pointerEvents="none">
            {[String(ddhhmmss[0]), ddhhmmss[1], ddhhmmss[2], ddhhmmss[3]].map(
              (val, idx) => (
                <View key={idx} style={styles.countBox}>
                  <Text style={styles.countText}>{val}</Text>
                </View>
              ),
            )}
          </View>

          <View style={styles.bannerRow}>
            {shouldShowBadge ? <Badge status={badgeStatus as any} /> : <View />}
            <Pressable
              onPress={async () => {
                try {
                  setLoading(true);
                  const res = await watchlistService.toggle(Number(vehicle.id));
                  console.log('rehck res', res);
                  if (res.is_favorite && res.locked) {
                    show("You can't toggle favorite while bidding", 'error');
                    return;
                  }

                  // Update local state immediately for better UX
                  setVehicle(prev =>
                    prev ? { ...prev, isFavorite: !prev.isFavorite } : prev,
                  );
                  show(res?.message || 'Favorite updated', 'success');
                } catch (e: any) {
                  show(
                    e?.response?.data?.message || 'Failed to update favorite',
                    'error',
                  );
                } finally {
                  setLoading(false);
                }
              }}
            >
              <MaterialIcons
                name={vehicle.isFavorite ? 'star' : 'star-border'}
                size={28}
                color={vehicle.isFavorite ? '#ef4444' : '#111827'}
              />
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              navigation.navigate('VehicleImages', {
                id: vehicle.id || route.params.id,
              });
            }}
          >
            <Image
              source={{ uri: vehicle.image } as any}
              style={styles.media}
              defaultSource={images.logo}
              onError={() => {
                // Fallback to logo on error
                setVehicle(prev => (prev ? { ...prev, image: undefined as any } : prev));
              }}
            />
          </Pressable>

          <Text style={styles.title}>{vehicle.title || 'N/A'}</Text>

          <View style={styles.specRow}>
            <Text style={styles.specItemAccent}>{vehicle.kms || 'N/A'}</Text>
            <Text style={styles.specItemAccent}>{vehicle.fuel || 'N/A'}</Text>
            <Text style={styles.specItemAccent}>{vehicle.owner || 'N/A'}</Text>
          </View>
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            <View style={styles.specRow}>
              <Text style={styles.additionalInfoLabel}>Regs. No.</Text>
              <Text style={styles.additionalInfoTitle}>{vehicle.regs_no || 'N/A'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.additionalInfoLabel}>Transmission</Text>
              <Text style={styles.additionalInfoTitle}>
                {vehicle.transmissionType || 'N/A'}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.additionalInfoLabel}>RC Availability</Text>
              <Text style={styles.additionalInfoTitle}>
                {vehicle.rc_availability == null ? 'N/A' : vehicle.rc_availability ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.additionalInfoLabel}>Repo Date</Text>
              <Text style={styles.additionalInfoTitle}>
                {vehicle.repo_date
                  ? new Date(vehicle.repo_date).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </View>
            {/* Yard Details */}
            <View style={styles.yardBox}>
              <Text style={styles.yardTitle}>YARD DETAILS</Text>
              <Text style={styles.yardLocation}>
                {vehicle.yard_address || 'N/A'}
              </Text>
              <View style={styles.yardDivider} />
              <Text style={styles.yardContact}>
                {vehicle.yard_contact_person_name || 'N/A'}
                {vehicle.yard_contact_person_name && vehicle.contact_person_contact_no
                  ? ' - '
                  : ''}
                {vehicle.contact_person_contact_no || ''}
              </Text>
              <Text style={styles.yardLocation}>
                {vehicle.yard_city || vehicle.yard_state
                  ? `${vehicle.yard_city || ''}${
                      vehicle.yard_city && vehicle.yard_state ? ', ' : ''
                    }${vehicle.yard_state || ''}`
                  : 'N/A'}
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.contactRow,
              { opacity: pressed && Platform.OS !== 'android' ? 0.9 : 1 },
            ]}
          >
            <View style={{...styles.contactRow, marginVertical: theme.spacing.sm}}>
              <MaterialIcons name="phone-iphone" color="#2563eb" size={18} />
              <Text style={styles.managerName}>{vehicle.manager_name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (vehicle.manager_phone) {
                  Linking.openURL(`tel:${vehicle.manager_phone}`);
                }
              }}
              style={styles.contactRow}
            >
              <Text style={styles.phone}>{vehicle.manager_phone}</Text>
            </TouchableOpacity>
          </Pressable>

          <View style={styles.actionRow}>
            <Button
              variant="secondary"
              title="₹ Place Bid"
              onPress={() => setManualBidOpen(true)}
            />
            <Pressable
              style={styles.settings}
              onPress={() => {
                spinOnce();
                setAutoBidOpen(true);
                loadAutoBidData();
              }}
            >
              <Animated.View style={{ transform: [{ rotate: settingsSpin }] }}>
                <MaterialIcons
                  name="settings"
                  size={22}
                  color={autoBidData ? theme.colors.primary : '#111827'}
                />
              </Animated.View>
            </Pressable>
          </View>
        </View>

        {/* Bid History Section */}
        <View style={styles.bidHistorySection}>
          <Text style={styles.bidHistoryTitle}>Bid History</Text>
          <FlatList
            data={history}
            keyExtractor={(item, i) => i.toString()}
            style={styles.bidHistoryContainer}
            onEndReached={loadMoreHistory}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
              loadingMoreHistory ? (
                <View style={styles.loadingMoreHistoryContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={styles.loadingMoreHistoryText}>Loading more history...</Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => {
              const isAuto = item.bid_mode === 'A';
              return (
                <View style={styles.bidHistoryCard}>
                  <View style={styles.bidHistoryContent}>
                    <View style={styles.bidHistoryLeft}>
                      <View
                        style={[
                          styles.bidHistoryIcon,
                          {
                            backgroundColor: isAuto
                              ? theme.colors.primary
                              : theme.colors.backgroundSecondary,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={isAuto ? 'auto-awesome' : 'touch-app'}
                          size={18}
                          color={
                            isAuto ? theme.colors.white : theme.colors.textMuted
                          }
                        />
                      </View>
                      <View style={styles.bidHistoryText}>
                        <Text style={styles.bidHistoryPrice}>
                          ₹ {item.bid_amt.toLocaleString?.() || item.bid_amt}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.bidHistoryRight}>
                      <Text style={styles.bidHistoryTime}>
                        {/* {new Date(item.created_dttm).toLocaleDateString()} */}
                        {new Date(item.created_dttm).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        </View>
      </ScrollView>

      <FullScreenLoader visible={loading} />

      <Modal
        visible={autoBidOpen}
        onClose={() => setAutoBidOpen(false)}
        title="Auto Bid"
      >
        {autoBidLoading ? (
          <View style={modalStyles.loadingContainer}>
            <Text style={modalStyles.loadingText}>
              Loading auto-bid data...
            </Text>
          </View>
        ) : (
          <>
            <View style={modalStyles.fieldRow}>
              <Text style={modalStyles.fieldLabel}>Start Amount</Text>
              <TextInput
                value={startAmount}
                onChangeText={setStartAmount}
                style={modalStyles.fieldInput}
                placeholder="e.g. 1000"
                keyboardType="numeric"
              />
            </View>
            <View style={modalStyles.fieldRow}>
              <Text style={modalStyles.fieldLabel}>Step Amount</Text>
              <TextInput
                value={stepAmount}
                onChangeText={setStepAmount}
                style={modalStyles.fieldInput}
                placeholder="e.g. 1000"
                keyboardType="numeric"
              />
            </View>
            <View style={modalStyles.fieldRow}>
              <Text style={modalStyles.fieldLabel}>Max. Bid</Text>
              <TextInput
                value={maxBid}
                onChangeText={setMaxBid}
                style={modalStyles.fieldInput}
                placeholder="e.g. 200000"
                keyboardType="numeric"
              />
            </View>

            <View style={modalStyles.limitBox}>
              {limitsLoading ? (
                <Text style={modalStyles.limitText}>Loading limits...</Text>
              ) : buyerLimits ? (
                <>
                  <Text style={modalStyles.limitText}>
                    Security Deposit: {buyerLimits.security_deposit.toLocaleString()}
                  </Text>
                  <Text style={modalStyles.limitText}>
                    Bid Limit: {buyerLimits.bid_limit.toLocaleString()}
                  </Text>
                  <Text style={modalStyles.limitText}>
                    Limit Used: {buyerLimits.limit_used.toLocaleString()}
                  </Text>
                  <Text style={modalStyles.limitText}>
                    Pending Limit: {buyerLimits.pending_limit.toLocaleString()}
                  </Text>
                  {buyerLimits.active_vehicle_bids?.length ? (
                    <View style={{ marginTop: 8 }}>
                      <Text style={modalStyles.fieldLabel}>Active Vehicle Bids</Text>
                      {buyerLimits.active_vehicle_bids.map(item => (
                        <Text key={`avb-${item.vehicle_id}`} style={modalStyles.limitText}>
                          Vehicle #{item.vehicle_id}: Max Bidded {item.max_bidded.toLocaleString()}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                  {buyerLimits.unpaid_vehicles?.length ? (
                    <View style={{ marginTop: 8 }}>
                      <Text style={modalStyles.fieldLabel}>Unpaid Vehicles</Text>
                      {buyerLimits.unpaid_vehicles.map(item => (
                        <Text key={`uv-${item.vehicle_id}`} style={modalStyles.limitText}>
                          Vehicle #{item.vehicle_id}: Unpaid {item.unpaid_amt.toLocaleString()}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </>
              ) : (
                <Text style={modalStyles.limitText}>Limits unavailable</Text>
              )}
            </View>

            <View style={modalStyles.modalActions}>
              <Pressable
                style={[
                  modalStyles.modalBtn,
                  modalStyles.deleteBtn,
                  !autoBidData && modalStyles.disabledBtn,
                ]}
                onPress={autoBidData ? deleteAutoBid : undefined}
                disabled={!autoBidData}
              >
                <Text
                  style={[
                    modalStyles.modalBtnText,
                    !autoBidData && modalStyles.disabledBtnText,
                  ]}
                >
                  Delete
                </Text>
              </Pressable>
              <Pressable
                style={[modalStyles.modalBtn, modalStyles.saveBtn]}
                onPress={saveAutoBid}
              >
                <Text style={modalStyles.modalBtnText}>Save</Text>
              </Pressable>
            </View>
          </>
        )}
      </Modal>

      {/* Manual Bid Modal */}
      <Modal
        visible={manualBidOpen}
        onClose={() => setManualBidOpen(false)}
        title="Place Manual Bid"
      >
        <View style={modalStyles.fieldRow}>
          <Text style={modalStyles.fieldLabel}>Bid Amount</Text>
          <TextInput
            value={bidAmount}
            onChangeText={setBidAmount}
            style={modalStyles.fieldInput}
            placeholder="e.g. 50000"
            keyboardType="numeric"
          />
        </View>

        <View style={modalStyles.limitBox}>
          {limitsLoading ? (
            <Text style={modalStyles.limitText}>Loading limits...</Text>
          ) : buyerLimits ? (
            <>
              <Text style={modalStyles.limitText}>
                Security Deposit: {buyerLimits.security_deposit.toLocaleString()}
              </Text>
              <Text style={modalStyles.limitText}>
                Bid Limit: {buyerLimits.bid_limit.toLocaleString()}
              </Text>
              <Text style={modalStyles.limitText}>
                Limit Used: {buyerLimits.limit_used.toLocaleString()}
              </Text>
              <Text style={modalStyles.limitText}>
                Pending Limit: {buyerLimits.pending_limit.toLocaleString()}
              </Text>
              {buyerLimits.active_vehicle_bids?.length ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={modalStyles.fieldLabel}>Active Vehicle Bids</Text>
                  {buyerLimits.active_vehicle_bids.map(item => (
                    <Text key={`avb2-${item.vehicle_id}`} style={modalStyles.limitText}>
                      Vehicle #{item.vehicle_id}: Max Bidded {item.max_bidded.toLocaleString()}
                    </Text>
                  ))}
                </View>
              ) : null}
              {buyerLimits.unpaid_vehicles?.length ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={modalStyles.fieldLabel}>Unpaid Vehicles</Text>
                  {buyerLimits.unpaid_vehicles.map(item => (
                    <Text key={`uv2-${item.vehicle_id}`} style={modalStyles.limitText}>
                      Vehicle #{item.vehicle_id}: Unpaid {item.unpaid_amt.toLocaleString()}
                    </Text>
                  ))}
                </View>
              ) : null}
            </>
          ) : (
            <Text style={modalStyles.limitText}>Limits unavailable</Text>
          )}
        </View>

        <View style={modalStyles.modalActions}>
          <Pressable
            style={[modalStyles.modalBtn, modalStyles.saveBtn]}
            onPress={placeBid}
          >
            <Text style={modalStyles.modalBtnText}>Place Bid</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  countBox: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
    marginHorizontal: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontWeight: '700',
    color: theme.colors.warning,
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fonts.bold,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  media: {
    width: '100%',
    height: 200,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  specItemAccent: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
  },
  contactText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
  },
  managerName: {
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: theme.fontSizes.lg,
  },
  phone: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.lg,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  inputBox: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    paddingLeft: theme.spacing.sm,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.card,
  },
  bidBtn: {
    backgroundColor: theme.colors.buttonSecondary,
    paddingHorizontal: theme.spacing.xl,
    height: 46,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  bidIcon: {
    marginRight: theme.spacing.xs,
  },
  bidText: {
    color: theme.colors.textInverse,
    fontWeight: '700',
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.bold,
  },
  settings: {
    width: 46,
    height: 46,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  table: {},
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  cell: {
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
  },
  bidHistorySection: {
    marginTop: theme.spacing.lg,
  },
  bidHistoryTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.bold,
  },
  bidHistoryContainer: {
    maxHeight: 300, // Limit height to enable scrolling
  },
  bidHistoryCard: {
    padding: theme.spacing.xs,
  },
  bidHistoryContent: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  bidHistoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '55%',
    gap: theme.spacing.md,
    flex: 1,
  },
  bidHistoryIcon: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidHistoryText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  bidHistoryPrice: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
    textAlign: 'right',
  },
  bidHistoryMode: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
  },
  bidHistoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%',
    gap: theme.spacing.sm,
  },
  bidHistoryTime: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
    textAlign: 'center',
  },
  additionalInfoLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
  },
  additionalInfoTitle: {
    color: theme.colors.text,
    fontWeight: '700',
    fontFamily: theme.fonts.medium,
  },
  yardBox: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
  },
  yardTitle: {
    color: theme.colors.text,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
    marginBottom: theme.spacing.xs,
  },
  yardLocation: {
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
    marginBottom: theme.spacing.xs,
  },
  yardDivider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.xs,
  },
  yardContact: {
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
  },
  loadingMoreHistoryContainer: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreHistoryText: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.regular,
  },
});

const modalStyles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  fieldLabel: {
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
  },
  fieldInput: {
    width: 160,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: theme.colors.error,
    marginRight: theme.spacing.sm,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  modalBtnText: {
    color: theme.colors.textInverse,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
  },
  disabledBtn: {
    backgroundColor: theme.colors.border,
    opacity: 0.5,
  },
  disabledBtnText: {
    color: theme.colors.textMuted,
  },
  loadingContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.medium,
  },
  limitBox: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  limitText: {
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
  phone: {
    color: theme.colors.primary,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  managerName: {
    fontWeight: '600',
    color: theme.colors.text,
  },
});
