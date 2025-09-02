import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../../../theme';
import SelectGroup, { Group } from '../../SelectGroupScreen';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/RootNavigator';

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const handleSelect = (_g: Group) => {
    navigation.navigate('VehicleList');
  };
  return (
    <View style={styles.container}>
      <SelectGroup onSelect={handleSelect} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  text: { color: theme.colors.text, fontSize: 18 }
});

export default HomeScreen;


