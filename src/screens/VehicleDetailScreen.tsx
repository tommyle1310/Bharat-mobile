import React, { useMemo, useEffect, useState } from 'react';
import { ScrollView, Image, View, Text, StyleSheet, Pressable, Platform, TextInput } from 'react-native';
import Modal from '../components/Modal';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { theme } from '../theme';
import { Vehicle } from '../data/vehicles';
import Badge from '../components/Badge';
import Header from '../components/Header';
import { Button } from '../components';

type Params = { vehicle?: Vehicle; id?: string };

export default function VehicleDetailScreen() {
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const navigation = useNavigation();
  const v = (route.params as Params)?.vehicle as Vehicle | undefined;
  if (!v) return null;

  const [remaining, setRemaining] = useState<number>(() => v.endTime ? Math.max(0, Math.floor((new Date(v.endTime).getTime() - Date.now()) / 1000)) : 0);

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
    const days = Math.floor(s / 86400); s -= days * 86400;
    const hours = Math.floor(s / 3600); s -= hours * 3600;
    const minutes = Math.floor(s / 60); s -= minutes * 60;
    const seconds = s;
    const pad = (n: number) => String(n).padStart(2, '0');
    return [days, pad(hours), pad(minutes), pad(seconds)] as [number, string, string, string];
  }, [remaining]);

  const [autoBidOpen, setAutoBidOpen] = useState(false);
  const [stepAmount, setStepAmount] = useState('');
  const [maxBid, setMaxBid] = useState('');
  const securityDeposit = 20000;
  const bidLimit = 200000;
  const limitUsed = 178000;
  const pendingLimit = bidLimit - limitUsed;

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
            {[String(ddhhmmss[0]), ddhhmmss[1], ddhhmmss[2], ddhhmmss[3]].map((val, idx) => (
              <View key={idx} style={styles.countBox}><Text style={styles.countText}>{val}</Text></View>
            ))}
          </View>

          <View style={styles.bannerRow}>
            <Badge status={v.status} />
            <MaterialIcons name={v.isFavorite ? 'star' : 'star-border'} size={22} color={v.isFavorite ? '#ef4444' : '#111827'} />
          </View>

          <Image source={v.image as any} style={styles.media} />

          <Text style={styles.title}>{v.title}</Text>

          <View style={styles.specRow}>
            <Text style={styles.specItemAccent}>{v.kms}</Text>
            <Text style={styles.specItemAccent}>{v.fuel}</Text>
            <Text style={styles.specItemAccent}>{v.owner}</Text>
          </View>

          <Pressable style={({ pressed }) => [styles.contactRow, { opacity: pressed && Platform.OS !== 'android' ? 0.9 : 1 }]}>
            <MaterialIcons name="phone-iphone" color="#2563eb" size={18} />
            <Text style={styles.contactText}>{v.manager_name} - <Text style={styles.phone}>{v.manager_phone}</Text></Text>
          </Pressable>

          <View style={styles.actionRow}>
            <View style={styles.inputBox} />
            <Button icon='dollar' variant='secondary' title="Bid" onPress={() => {}} />
            <Pressable style={styles.settings} onPress={() => setAutoBidOpen(true)}>
              <MaterialIcons name="settings" size={22} color="#111827" />
            </Pressable>
          </View>
        </View>

        {/* Bid History Section */}
        <View style={styles.bidHistorySection}>
          <Text style={styles.bidHistoryTitle}>Bid History</Text>
          <View style={styles.bidHistoryContainer}>
            {[
              { price: '3,50,000/-', time: '3:34:52', mode: 'Manual' },
              { price: '3,45,000/-', time: '3:21:00', mode: 'Manual' },
              { price: '3,20,000/-', time: '2:20:05', mode: 'Auto' },
              { price: '3,15,000/-', time: '2:20:01', mode: 'Auto' },
            ].map((r, i) => (
              <View key={i} style={styles.bidHistoryCard}>
                <View style={styles.bidHistoryContent}>
                  <View style={styles.bidHistoryLeft}>
                    <View style={[styles.bidHistoryIcon, { backgroundColor: r.mode === 'Auto' ? theme.colors.primary : theme.colors.backgroundSecondary }]}>
                      <MaterialIcons 
                        name={r.mode === 'Auto' ? 'settings' : 'person'} 
                        size={16} 
                        color={r.mode === 'Auto' ? theme.colors.white : theme.colors.textMuted} 
                      />
                    </View>
                    <View style={styles.bidHistoryText}>
                      <Text style={styles.bidHistoryPrice}>{r.price}</Text>
                      <Text style={styles.bidHistoryMode}>{r.mode} Bid</Text>
                    </View>
                  </View>
                  <View style={styles.bidHistoryRight}>
                    <Text style={styles.bidHistoryTime}>{r.time}</Text>
                    <MaterialIcons name="chevron-right" size={16} color={theme.colors.textMuted} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={autoBidOpen} onClose={() => setAutoBidOpen(false)} title="Auto Bid">
     
            <View style={modalStyles.fieldRow}>
              <Text style={modalStyles.fieldLabel}>Step Amount</Text>
              <TextInput value={stepAmount} onChangeText={setStepAmount} style={modalStyles.fieldInput} placeholder="e.g. 1000" keyboardType="numeric" />
            </View>
            <View style={modalStyles.fieldRow}>
              <Text style={modalStyles.fieldLabel}>Max. Bid</Text>
              <TextInput value={maxBid} onChangeText={setMaxBid} style={modalStyles.fieldInput} placeholder="e.g. 200000" keyboardType="numeric" />
            </View>

            <View style={modalStyles.limitBox}>
              <Text style={modalStyles.limitText}>Security Deposit: {securityDeposit.toLocaleString()}</Text>
              <Text style={modalStyles.limitText}>Bid Limit: {bidLimit.toLocaleString()}</Text>
              <Text style={modalStyles.limitText}>Limit Used: {limitUsed.toLocaleString()}</Text>
              <Text style={modalStyles.limitText}>Pending Limit: {pendingLimit.toLocaleString()}</Text>
            </View>

            <View style={modalStyles.modalActions}>
              <Pressable style={[modalStyles.modalBtn, modalStyles.deleteBtn]} onPress={() => setAutoBidOpen(false)}>
                <Text style={modalStyles.modalBtnText}>Delete</Text>
              </Pressable>
              <Pressable style={[modalStyles.modalBtn, modalStyles.saveBtn]} onPress={() => setAutoBidOpen(false)}>
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
    backgroundColor: theme.colors.background 
  },
  scrollContent: { 
    padding: theme.spacing.md 
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
    marginBottom: theme.spacing.sm 
  },
  media: { 
    width: '100%', 
    height: 200, 
    borderRadius: theme.radii.md, 
    marginTop: theme.spacing.xs, 
    marginBottom: theme.spacing.sm 
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
    marginBottom: theme.spacing.md 
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
  phone: { 
    color: theme.colors.primary 
  },
  actionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: theme.spacing.md, 
    gap: theme.spacing.md 
  },
  inputBox: { 
    flex: 1, 
    height: 46, 
    borderWidth: 1, 
    borderColor: theme.colors.border, 
    borderRadius: theme.radii.md, 
    backgroundColor: theme.colors.card 
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
    justifyContent: 'center' 
  },
  table: {},
  rowItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: theme.spacing.sm 
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
  }
});

const modalStyles = StyleSheet.create({
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: theme.spacing.md 
  },
  fieldRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: theme.spacing.sm 
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
    marginTop: theme.spacing.md 
  },
  modalBtn: { 
    flex: 1, 
    height: 46, 
    borderRadius: theme.radii.lg, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  deleteBtn: { 
    backgroundColor: theme.colors.error, 
    marginRight: theme.spacing.sm 
  },
  saveBtn: { 
    backgroundColor: theme.colors.primary, 
    marginLeft: theme.spacing.sm 
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
    marginTop: theme.spacing.xs 
  },
  limitText: { 
    color: theme.colors.text, 
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
});


