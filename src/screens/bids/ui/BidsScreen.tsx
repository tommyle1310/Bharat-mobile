import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { getVehicles } from '../../../data/vehicles';
import VehicleCard from '../../../components/VehicleCard';
import Header from '../../../components/Header';
import { theme } from '../../../theme';

const BidsScreen = () => {
  const data = getVehicles().filter(v => v.hasBid || v.isFavorite);
  return (
    <View style={styles.container}>
      <Header 
        type="master" 
        title="My Bids" 
        onBackPress={() => {/* navigation.goBack() */}}
        rightIcon="add"
        onRightIconPress={() => {/* Handle add bid */}}
      />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <VehicleCard {...item} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: { 
    padding: theme.spacing.md 
  }
});

export default BidsScreen;


