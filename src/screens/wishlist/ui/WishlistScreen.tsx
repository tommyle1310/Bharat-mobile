import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getVehicles } from '../../../data/vehicles';
import VehicleCard from '../../../components/VehicleCard';
import Header from '../../../components/Header';
import { theme } from '../../../theme';
import { FilterModal } from '../../../components';

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
  const [showFilterModal, setShowFilterModal] = useState(false);
  return (
    <View style={styles.container}>
      <Header 
        type="master" 
        title="Wishlist" 
        onRightIconPress={() => setShowFilterModal(true)}
                // canGoBack
        shouldRenderRightIcon={true}
                onBackPress={() => navigation.goBack()}
      />
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <VehicleCard {...item} status={item.bidding_status} />
        )}
      />
      <FilterModal visible={showFilterModal} onClose={() => setShowFilterModal(false)} onApply={() => {}} />
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


