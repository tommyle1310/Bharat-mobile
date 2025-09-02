import React, { useMemo, useEffect, useState } from 'react';
import { ScrollView, Image, View, Text, StyleSheet, Pressable, Platform, TextInput } from 'react-native';
import Modal from '../components/Modal';
import { RouteProp, useRoute } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import { Vehicle } from '../data/vehicles';
import Badge from '../components/Badge';

type Params = { vehicle?: Vehicle; id?: string };

export default function VehicleDetailScreen() {
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
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
    <ScrollView contentContainerStyle={styles.container}>
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

        <Image source={{ uri: v.image }} style={styles.media} />

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
          <Pressable style={styles.bidBtn}><Text style={styles.bidText}>Bid</Text></Pressable>
          <Pressable style={styles.settings} onPress={() => setAutoBidOpen(true)}>
            <MaterialIcons name="settings" size={22} color="#111827" />
          </Pressable>
        </View>

        <View style={styles.table}>
          {[
            { price: '3,50,000/-', time: '3:34:52', mode: 'Manual' },
            { price: '3,45,000/-', time: '3:21:00', mode: 'Manual' },
            { price: '3,20,000/-', time: '2:20:05', mode: 'Auto' },
            { price: '3,15,000/-', time: '2:20:01', mode: 'Auto' },
          ].map((r, i) => (
            <View key={i} style={styles.rowItem}>
              <Text style={styles.cell}>{r.price}</Text>
              <Text style={styles.cell}>{r.time}</Text>
              <Text style={styles.cell}>{r.mode}</Text>
            </View>
          ))}
        </View>
      </View>

      <Modal visible={autoBidOpen} onClose={() => setAutoBidOpen(false)} title="Auto Bid">
        <View style={modalStyles.modalHeaderIcon}>
          <MaterialIcons name="change-history" size={20} color="#111827" />
        </View>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: '#ffffff' },
  card: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  countdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  countBox: {
    flex: 1,
    height: 44,
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  countText: { fontWeight: '800', color: '#d97706', fontSize: 18 },
  bannerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  banner: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  bannerText: { color: '#fff', fontWeight: '800' },
  media: { width: '100%', height: 200, borderRadius: 10, marginTop: 6, marginBottom: 10 },
  title: { color: '#111827', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  specItemAccent: { color: '#2563eb', fontWeight: '800' },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  contactText: { color: '#111827', fontWeight: '700' },
  phone: { color: '#2563eb' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12 },
  inputBox: { flex: 1, height: 46, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, backgroundColor: '#fff' },
  bidBtn: { backgroundColor: '#f59e0b', paddingHorizontal: 26, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  bidText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  settings: { width: 46, height: 46, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },
  table: {},
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cell: { color: '#111827', fontWeight: '600' }
});

const modalShadow = { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 8 } as const;

const modalStyles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '88%', borderRadius: 16, backgroundColor: '#fff', padding: 16, ...modalShadow },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  fieldLabel: { color: '#111827', fontWeight: '600' },
  fieldInput: { width: 160, height: 44, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, paddingHorizontal: 10 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  modalBtn: { flex: 1, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { backgroundColor: '#ef4444', marginRight: 8 },
  saveBtn: { backgroundColor: '#2563eb', marginLeft: 8 },
  modalBtnText: { color: '#fff', fontWeight: '800' },
  limitBox: { backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#eef2f7', padding: 12, marginTop: 6 },
  limitText: { color: '#111827', marginBottom: 4 },
});


