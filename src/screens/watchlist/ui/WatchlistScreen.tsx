import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import VehicleCard from '../../../components/VehicleCard';
import { getVehicles } from '../../../data/vehicles';

const WatchlistScreen = () => {
  const data = getVehicles().filter(v => v.isFavorite);
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <VehicleCard {...item} />}
    />
  );
};

const styles = StyleSheet.create({ list: { padding: 12 } });

export default WatchlistScreen;


