import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { theme } from '../theme';
import Tab from './Tab';
import VehicleListScreen from '../screens/VehicleListScreen';
import GroupCard from './GroupCard';
import SelectGroupScreen from '../screens/SelectGroupScreen';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';

const VerticalSelection = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  
  const [selectedTab, setSelectedTab] = useState<'I' | 'B'>('I');
  const tabOptions = [
    { label: 'Insurance', value: 'I' },
    { label: 'Bank', value: 'B' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <Tab 
        options={tabOptions}
        selectedValue={selectedTab}
        onValueChange={(v) => setSelectedTab(v as 'I' | 'B')}
        style={{ marginHorizontal: theme.spacing.lg, marginTop: theme.spacing.md }}
      />
      <View style={{ flex: 1 }}>
        <SelectGroupScreen onSelect={(group) => navigation.navigate('VehicleList', { group: {...group, businessVertical: selectedTab as any} })} businessVertical={selectedTab} />
      </View>
    </View>
  );
};

export default VerticalSelection;
