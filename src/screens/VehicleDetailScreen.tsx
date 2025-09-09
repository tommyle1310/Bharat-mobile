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
import bidService, { BidHistoryItem } from '../services/bidService';
import { useUser } from '../hooks/useUser';
import FullScreenLoader from '../components/FullScreenLoader';
import { useToast } from '../components/Toast';

type Params = { vehicle?: Vehicle; id?: string };

export default function VehicleDetailScreen() {
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const navigation = useNavigation<any>();
  const v = (route.params as Params)?.vehicle as Vehicle | undefined;
  if (!v) return null;
  const { buyerId } = useUser();
  const { show } = useToast();
  const [remaining, setRemaining] = useState<number>(() =>
    v.endTime
      ? Math.max(
          0,
          Math.floor((new Date(v.endTime).getTime() - Date.now()) / 1000),
        )
      : 0,
  );

  useEffect(() => {
    if (!v.endTime) return;
    const id = setInterval(() => {
      const end = new Date(v.endTime as string).getTime();
      setRemaining(Math.max(0, Math.floor((end - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(id);
  }, [v.endTime]);

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
  const [startAmount, setStartAmount] = useState('');
  const [stepAmount, setStepAmount] = useState('');
  const [maxBid, setMaxBid] = useState('');
  const [bidAmount, setBidAmount] = useState('');
  const [history, setHistory] = useState<BidHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const securityDeposit = 20000;
  const bidLimit = 200000;
  const limitUsed = 178000;
  const pendingLimit = bidLimit - limitUsed;
  console.log('cehck buyerId', buyerId, v?.id)
  const loadHistory = useCallback(async () => {
    if (!buyerId || !v?.id) return;
    console.log('check fall here')
    try {
      setLoading(true);
      const items = await bidService.getHistoryByVehicle(buyerId, Number(v.id));
      console.log('cehck items', items)
      setHistory(items);
    } catch (e: any) {
      show(e?.response?.data?.message || 'Failed to load bid history', 'error');
    } finally {
      setLoading(false);
    }
  }, [buyerId, v?.id, show]);

  useEffect(() => {
    if (buyerId && v?.id) {
      loadHistory();
    }
  }, [buyerId, v?.id, loadHistory]);

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
      const res = await bidService.placeManualBid({ buyer_id: buyerId, vehicle_id: Number(v.id), bid_amount: amt });
      show(res?.message || 'Bid placed successfully', 'success');
      setBidAmount('');
      loadHistory();
    } catch (e: any) {
      show(e?.response?.data?.message || 'Failed to place bid', 'error');
    } finally {
      setLoading(false);
    }
  };

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
      const res = await bidService.setAutoBid({ buyer_id: buyerId, vehicle_id: Number(v.id), start_amount: start, max_bid: max, step_amount: step });
      show(res?.message || 'Auto-bid saved', 'success');
      setAutoBidOpen(false);
    } catch (e: any) {
      show(e?.response?.data?.message || 'Failed to save auto-bid', 'error');
    } finally {
      setLoading(false);
    }
  };

  const shouldShowBadge = (v as any)?.has_bidded !== false;
  const badgeStatus = (v as any)?.has_bidded ? 'Winning' : 'Losing';

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            <MaterialIcons
              name={v.isFavorite ? 'star' : 'star-border'}
              size={22}
              color={v.isFavorite ? '#ef4444' : '#111827'}
            />
          </View>
          <Pressable
            onPress={() => {
              console.log('cehck vehsa id', v.id || route.params.id);
              navigation.navigate('VehicleImages', { id: v.id || route.params.id });
            }}
          >
            <Image source={{ uri: v.image } as any} style={styles.media} />
          </Pressable>

          <Text style={styles.title}>{v.title}</Text>

          <View style={styles.specRow}>
            <Text style={styles.specItemAccent}>{v.kms}</Text>
            <Text style={styles.specItemAccent}>{v.fuel}</Text>
            <Text style={styles.specItemAccent}>{v.owner}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.contactRow,
              { opacity: pressed && Platform.OS !== 'android' ? 0.9 : 1 },
            ]}
          >
            <View style={styles.contactRow}>
              <MaterialIcons
                name="verified-user"
                color={theme.colors.primary}
                size={18}
              />
              <Text style={styles.managerName}>{v.manager_name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (v.manager_phone) {
                  Linking.openURL(`tel:${v.manager_phone}`);
                }
              }}
              style={styles.contactRow}
            >
              <MaterialIcons name="phone-iphone" color="#2563eb" size={18} />
              <Text style={styles.phone}>{v.manager_phone}</Text>
            </TouchableOpacity>
          </Pressable>

          <View style={styles.actionRow}>
            <TextInput
              value={bidAmount}
              onChangeText={setBidAmount}
              placeholder="Enter bid"
              keyboardType="numeric"
              style={styles.inputBox}
            />
            <Button variant="secondary" title="₹ Bid" onPress={placeBid} />
            <Pressable
              style={styles.settings}
              onPress={() => setAutoBidOpen(true)}
            >
              <MaterialIcons name="settings" size={22} color="#111827" />
            </Pressable>
          </View>
        </View>

        {/* Bid History Section */}
        <View style={styles.bidHistorySection}>
          <Text style={styles.bidHistoryTitle}>Bid History</Text>
          <View style={styles.bidHistoryContainer}>
            {history.map((item) => {
              const isAuto = item.bid_mode === 'A';
              return (
                <View key={item.bid_id} style={styles.bidHistoryCard}>
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
                          name={isAuto ? 'settings' : 'person'}
                          size={16}
                          color={isAuto ? theme.colors.white : theme.colors.textMuted}
                        />
                      </View>
                      <View style={styles.bidHistoryText}>
                        <Text style={styles.bidHistoryPrice}>₹ {item.bid_amt.toLocaleString?.() || item.bid_amt}</Text>
                        <Text style={styles.bidHistoryMode}>{isAuto ? 'Auto' : 'Manual'} Bid</Text>
                      </View>
                    </View>
                    <View style={styles.bidHistoryRight}>
                      <Text style={styles.bidHistoryTime}>{new Date(item.created_dttm).toLocaleString()}</Text>
                      <MaterialIcons name="chevron-right" size={16} color={theme.colors.textMuted} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <FullScreenLoader visible={loading} />

      <Modal
        visible={autoBidOpen}
        onClose={() => setAutoBidOpen(false)}
        title="Auto Bid"
      >
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
          <Text style={modalStyles.limitText}>
            Security Deposit: {securityDeposit.toLocaleString()}
          </Text>
          <Text style={modalStyles.limitText}>
            Bid Limit: {bidLimit.toLocaleString()}
          </Text>
          <Text style={modalStyles.limitText}>
            Limit Used: {limitUsed.toLocaleString()}
          </Text>
          <Text style={modalStyles.limitText}>
            Pending Limit: {pendingLimit.toLocaleString()}
          </Text>
        </View>

        <View style={modalStyles.modalActions}>
          <Pressable
            style={[modalStyles.modalBtn, modalStyles.deleteBtn]}
            onPress={() => setAutoBidOpen(false)}
          >
            <Text style={modalStyles.modalBtnText}>Delete</Text>
          </Pressable>
          <Pressable
            style={[modalStyles.modalBtn, modalStyles.saveBtn]}
            onPress={saveAutoBid}
          >
            <Text style={modalStyles.modalBtnText}>Save</Text>
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
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
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
  },
  phone: {
    color: theme.colors.primary,
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
    gap: theme.spacing.sm,
  },
  bidHistoryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  bidHistoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bidHistoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  bidHistoryIcon: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bidHistoryText: {
    flex: 1,
  },
  bidHistoryPrice: {
    fontSize: theme.fontSizes.md,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  bidHistoryMode: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
  },
  bidHistoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  bidHistoryTime: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
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
