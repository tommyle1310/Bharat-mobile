import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { getVehicles } from '../../../data/vehicles';
import VehicleCard from '../../../components/VehicleCard';

const WishlistScreen = () => {
  const data = getVehicles().filter(v => v.isFavorite);
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <VehicleCard {...item} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: { padding: 12 }
});

export default WishlistScreen;


