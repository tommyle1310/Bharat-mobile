import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../../theme';
import SelectGroup, { Group } from '../../SelectGroupScreen';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import Header from '../../../components/Header';
import VerticalSelection from '../../../components/VerticalSelection';
import { useUser } from '../../../hooks/useUser';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { businessVertical, username, setBusinessVertical, token, refreshToken } = useUser();

  const handleSelect = (_g: Group) => {
    navigation.navigate('VehicleList', {
      group: { type: _g.type, title: _g.title },
    });
  };
  console.log('businessVertical', businessVertical);
  console.log('username', token, refreshToken);
  return (
    <View style={styles.container}>
      <Header
        type="home"
        title={`Hey, ${username || 'User'}!`}
        onFavoritePress={() => {
          navigation.navigate('Wishlist');
        }}
        onAddPress={() => {
          /* Handle add */
        }}
        onInboxPress={() => {
          /* Handle inbox */
        }}
        onNotificationPress={() => {
          /* Handle notifications */
        }}
        onAvatarPress={() => {
          /* Handle avatar */
        }}
        notificationCount={10}
        showNotificationBadge={true}
      />
      {!businessVertical && (
        // <VerticalSelection onSelect={handleSelect} />
        <SelectGroup onSelect={handleSelect} />
      )}
      {businessVertical === 'I' || businessVertical === 'B' ? (
        <SelectGroup onSelect={handleSelect} />
      ) : businessVertical === 'A' ? (
        <VerticalSelection />
      ) : (
        <SelectGroup onSelect={handleSelect} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  text: { color: theme.colors.text, fontSize: 18 },
});

export default HomeScreen;
