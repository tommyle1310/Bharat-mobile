import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import VehicleCard from '../../../components/VehicleCard';
import { getVehicles } from '../../../data/vehicles';
import { Header } from '../../../components';

const WatchlistScreen = () => {
  const data = getVehicles().filter(v => v.isFavorite);
  return (
    <>
     <Header 
        type="master" 
        title="My Watchlist" 
        shouldRenderRightIcon={false}
        onBackPress={() => {/* navigation.goBack() */}}
        rightIcon="add"
        onRightIconPress={() => {/* Handle add bid */}}
      />
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => <VehicleCard {...item} />}
      />
      </>
  );
};

const styles = StyleSheet.create({ list: { padding: 12 } });

export default WatchlistScreen;


