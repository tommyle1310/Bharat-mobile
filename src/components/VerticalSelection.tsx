import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { theme } from '../theme';
import Tab from './Tab';
import VehicleListScreen from '../screens/VehicleListScreen';
import GroupCard from './GroupCard';
import SelectGroupScreen from '../screens/SelectGroupScreen';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';
import { EBusinessVertical } from '../types/common';

const VerticalSelection = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedTab, setSelectedTab] = useState<
    Exclude<EBusinessVertical, EBusinessVertical.ALL>
  >(EBusinessVertical.INSURANCE);

  const tabOptions = [
    { label: 'Insurance', value: EBusinessVertical.INSURANCE },
    { label: 'Bank', value:EBusinessVertical.BANK },
  ];

  return (
    <View style={{ flex: 1, }}>
      <Tab
        options={tabOptions}
        selectedValue={selectedTab}
        onValueChange={v => setSelectedTab(v as Exclude<EBusinessVertical, EBusinessVertical.ALL>)}
        style={{
          marginHorizontal: theme.spacing.lg,
          marginTop: theme.spacing.md,
        }}
      />
      <View style={{ flex: 1, }}>
        <SelectGroupScreen
          businessVertical={selectedTab}
        />
      </View>
    </View>
  );
};

export default VerticalSelection;
