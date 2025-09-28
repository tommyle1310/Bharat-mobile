import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Tab from '../../../components/Tab';
import { theme } from '../../../theme';
import { Header } from '../../../components';
import winService, { WinVehicle } from '../../../services/winService';
import { resolveBaseUrl } from '../../../config';
import { ordinal } from '../../../libs/function';

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
  const [selectedTab, setSelectedTab] = useState('approval');
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<WinVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabOptions = [
    { label: 'Approval Pending', value: 'approval' },
    { label: 'Payment Pending', value: 'payment' },
    { label: 'Completed', value: 'completed' },
  ];

  const fetchWinVehicles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await winService.getWinVehicles(1);
      setVehicles(response.data.data);
    } catch (err) {
      console.error('Error fetching win vehicles:', err);
      setError('Failed to load win vehicles');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWinVehicles();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWinVehicles();
  }, []);

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
        
        return istDate.toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).replace(',', '');
      }
      
      // Fallback
      return new Date(timestamp).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).replace(',', '');
    } catch (error) {
      // Fallback for invalid timestamps
      return new Date(timestamp).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).replace(',', '');
    }
  };

  const formatDate = (dateString: string) => {
    return formatTimestampInIST(dateString);
  };

  const navToDetail = (vehicle: WinVehicle) => navigation.navigate('VehicleDetail', { 
    vehicle: {
      id: vehicle.vehicle_id,
      title: `${vehicle.make} ${vehicle.model} ${vehicle.variant} (${vehicle.manufacture_year})`,
      image: `${resolveBaseUrl()}/data-files/vehicles/${vehicle.vehicleId}/${vehicle.imgIndex}.${vehicle.img_extension}`,
      kms: formatKm(vehicle.odometer),
      fuel: vehicle.fuel || 'N/A',
      owner: ordinal(Number(vehicle.owner_serial)) === '0th' ? 'Current Owner' : `${ordinal(Number(vehicle.owner_serial))} Owner`,
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
    }
  });

  const renderContent = () => {
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

    if (vehicles.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No win vehicles found</Text>
        </View>
      );
    }

    return vehicles.map((vehicle, index) => (
      <Section 
        key={vehicle.vehicle_id} 
        title="Approval Pending" 
        color={theme.colors.warning} 
        onPress={() => navToDetail(vehicle)}
      >
        <Text style={styles.lineTitle}>
          {vehicle.make} {vehicle.model} {vehicle.variant} ({vehicle.manufacture_year})
        </Text>
        <Text style={styles.line}>
          {formatDate(vehicle.end_time)}        {Number(vehicle.bid_amount).toLocaleString()}/-
        </Text>
        <Text style={styles.lineAlt}>{vehicle.manager_name} - {vehicle.manager_phone}</Text>
      </Section>
    ));
  };

  return (
    <View style={styles.container}>
       <Header 
        type="master" 
        title="Wins"
        shouldRenderRightIcon={false} 
        onBackPress={() => {/* navigation.goBack() */}}
        rightIcon="add"
        onRightIconPress={() => {/* Handle add bid */}}
      />
      <Tab 
        options={tabOptions} 
        selectedValue={selectedTab} 
        onValueChange={setSelectedTab}
        style={styles.tabContainer}
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  scrollContent: { 
    padding: theme.spacing.lg, 
    paddingBottom: 40 
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
    marginBottom: theme.spacing.sm 
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
    paddingHorizontal: theme.spacing.xs 
  },
  lineTitle: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: '700', 
    marginBottom: theme.spacing.sm, 
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  line: { 
    fontSize: theme.fontSizes.sm, 
    marginBottom: theme.spacing.xs, 
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  lineAlt: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary, 
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  },
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


