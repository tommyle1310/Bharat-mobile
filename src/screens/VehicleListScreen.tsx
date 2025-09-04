import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import VehicleCard from '../components/VehicleCard';
import Header from '../components/Header';
import { theme } from '../theme';
import { vehicleServices, VehicleApi } from '../services/vehicleServices';

export type Vehicle = {
  id: string;
  title: string;
  image: string;
  kms: string;
  fuel: string;
  owner: string;
  region: string;
  status: 'Winning' | 'Losing';
  isFavorite?: boolean;
  endTime?: string;
  manager_name: string;
  manager_phone: string;
};

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatKm(value: string | number) {
  const num = Number(value || 0);
  return num.toLocaleString(undefined) + ' km';
}

type Params = { group?: { type?: string; title: string } };

export default function VehicleListScreen() {
  useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const selectedGroup = route.params?.group;

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const headerTitle = selectedGroup?.title || 'Vehicles';

  const fetchVehicles = async () => {
    console.log('checking fetch vehicles called', selectedGroup);
    if (!selectedGroup?.title || !selectedGroup?.type) return;
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleServices.getVehiclesByGroup({ title: selectedGroup.title || '', type: selectedGroup.type });
      const mapped: Vehicle[] = (data || []).map((v: VehicleApi) => ({
        id: v.vehicle_id,
        title: `${v.make} ${v.model} ${v.variant} (${v.manufacture_year})`,
        image: v.main_image,
        kms: formatKm(v.odometer),
        fuel: v.fuel,
        owner: `${ordinal(Number(v.owner_serial)) === '0th' ? 'Current Owner' : `${ordinal(Number(v.owner_serial))} Owner`}` as string,
        region: v.state_rto,
        status: Math.random() > 0.5 ? 'Winning' : 'Losing',
        isFavorite: v.is_favorite ?? false,
        endTime: v.end_time,
        manager_name: v.manager_name,
        manager_phone: v.manager_phone,
      }));
      setVehicles(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup?.title, selectedGroup?.type]);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.stateText}>Loading vehicles…</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateContainer}>
          <Text style={[styles.stateText, { color: theme.colors.error }]}>{error}</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <VehicleCard
            image={item.image}
            title={item.title}
            kms={item.kms}
            fuel={item.fuel}
            owner={item.owner}
            region={item.region}
            status={item.status}
            isFavorite={item.isFavorite}
            endTime={item.endTime}
            manager_name={item.manager_name}
            manager_phone={item.manager_phone}
          />
        )}
        ListEmptyComponent={!loading ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>No vehicles found.</Text>
          </View>
        ) : null}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        type="search" 
        canGoBack
        searchPlaceholder="Search vehicles..."
        onBackPress={() => navigation.goBack()}
        onFilterPress={() => {}}
        title={headerTitle}
      />
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.md,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  stateText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
  },
});


