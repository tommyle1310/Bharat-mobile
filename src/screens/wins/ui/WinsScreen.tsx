import React from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Section = ({ title, color, onPress, children }: { title: string; color: string; onPress?: () => void; children: React.ReactNode }) => (
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
  const navToDetail = () => navigation.navigate('VehicleDetail', { vehicle: {
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
    title: 'Honda BRIO 1.2 VX AT (2015)',
    kms: '45,000 km',
    fuel: 'CNG',
    owner: '2nd Owner',
    region: 'HR',
    status: 'Winning',
    manager_name: 'Ramesh Tyagi',
    manager_phone: '978988132'
  } });
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Section title="Approval Pending" color="#f59e0b" onPress={navToDetail}>
        <Text style={styles.lineTitle}>Honda BRIO 1.2 VX AT (2015)</Text>
        <Text style={styles.line}>24-Aug-2025        3,45,000/-</Text>
        <Text style={styles.lineAlt}>Ramesh Tyagi - 978988132</Text>
      </Section>
      <Section title="Payment Pending" color="#ef4444" onPress={navToDetail}>
        <Text style={styles.lineTitle}>Honda BRIO 1.2 VX AT (2015)</Text>
        <Text style={styles.line}>24-Aug-2025        3,45,000/-</Text>
        <Text style={styles.lineAlt}>Approved On 26-Aug-2025</Text>
        <Text style={styles.lineAlt}>Ramesh Tyagi - 978988132</Text>
      </Section>
      <Section title="Completed" color="#22c55e" onPress={navToDetail}>
        <Text style={styles.lineTitle}>Honda BRIO 1.2 VX AT (2015)</Text>
        <Text style={styles.line}>24-Aug-2025        3,45,000/-</Text>
        <Text style={styles.lineAlt}>Approved On 26-Aug-2025</Text>
        <Text style={styles.lineAlt}>Ramesh Tyagi - 978988132</Text>
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 12,
  },
  badgeText: { color: '#fff', fontWeight: '700' },
  body: { paddingHorizontal: 4 },
  lineTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8, color: '#111827' },
  line: { fontSize: 14, marginBottom: 6, color: '#111827' },
  lineAlt: { fontSize: 14, color: '#374151', marginBottom: 6 }
});

export default WinsScreen;


