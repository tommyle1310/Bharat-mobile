import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getVehicles } from '../../../data/vehicles';
import VehicleCard from '../../../components/VehicleCard';
import Header from '../../../components/Header';
import { theme } from '../../../theme';

type RootStackParamList = {
  Tabs: undefined;
  VehicleList: undefined;
  VehicleDetail: { vehicle?: any; id?: string };
  Wishlist: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WishlistScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const data = getVehicles().filter(v => v.isFavorite);
  
  return (
    <View style={styles.container}>
      <Header 
        type="master" 
        title="Wishlist" 
        onBackPress={() => navigation.goBack()}
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
    padding: 12 
  }
});

export default WishlistScreen;


