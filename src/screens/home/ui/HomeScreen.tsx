import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../../theme';
import SelectGroup, { Group } from '../../SelectGroupScreen';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import Header from '../../../components/Header';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const handleSelect = (_g: Group) => {
    navigation.navigate('VehicleList', { group: { type: _g.type, title: _g.title } });
  };
  return (
    <View style={styles.container}>
      <Header 
        type="secondary" 
        title="Hey, Tommy!"
        onFavoritePress={() => {navigation.navigate('Wishlist')}}
        onAddPress={() => {/* Handle add */}}
        onInboxPress={() => {/* Handle inbox */}}
        onNotificationPress={() => {/* Handle notifications */}}
        onAvatarPress={() => {/* Handle avatar */}}
        notificationCount={10}
        showNotificationBadge={true}
      />
      <SelectGroup onSelect={handleSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  text: { color: theme.colors.text, fontSize: 18 }
});

export default HomeScreen;


