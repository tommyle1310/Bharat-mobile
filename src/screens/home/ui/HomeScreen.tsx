import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../../theme';
import SelectGroup, { Group } from '../../SelectGroupScreen';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import Header from '../../../components/Header';
import VerticalSelection from '../../../components/VerticalSelection';
import { useUser } from '../../../hooks/useUser';
import { EBusinessVertical } from '../../../types/common';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { businessVertical, username, setBusinessVertical, token, refreshToken } = useUser();

  const handleSelect = (_g: Group) => {
    // No-op: navigation happens inside SelectGroupScreen via stack
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
      {businessVertical === EBusinessVertical.INSURANCE || businessVertical === EBusinessVertical.BANK ? (
        <SelectGroup onSelect={handleSelect} businessVertical={businessVertical} />
      ) : businessVertical === EBusinessVertical.ALL ? (
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
