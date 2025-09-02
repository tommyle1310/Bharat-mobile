import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';
import VehicleCard from '../components/VehicleCard';

type Vehicle = {
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
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatKm(value: string) {
  const num = Number(value || 0);
  return num.toLocaleString(undefined) + ' km';
}

const rawData: Array<{
  vehicle_id: string;
  end_time: string;
  odometer: string;
  fuel: string;
  owner_serial: string;
  state_rto: string;
  make: string;
  model: string;
  variant: string;
  manufacture_year: string;
  main_image: string;
  status: 'Winning' | 'Losing';
  is_favorite?: boolean;
  manager_name: string;
  manager_phone: string;
}> = require('../data/vehicleListScreen.json');

const VEHICLES: Vehicle[] = rawData.map(v => ({
  id: v.vehicle_id,
  title: `${v.make} ${v.model} ${v.variant} (${v.manufacture_year})`,
  image: v.main_image,
  kms: formatKm(v.odometer),
  fuel: v.fuel,
  owner: `${ordinal(Number(v.owner_serial))} Owner`,
  region: v.state_rto,
  status: v.status,
  isFavorite: v.is_favorite ?? false,
  endTime: v.end_time,
  manager_name: v.manager_name,
  manager_phone: v.manager_phone,
}));

export default function VehicleListScreen() {
  useTheme();
  useNavigation();

  return (
    <FlatList
      data={VEHICLES}
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
          isFavorite={true}
          endTime={item.endTime}
          manager_name={item.manager_name}
          manager_phone={item.manager_phone}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 12,
  },
});


