import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme, useNavigation, NavigationProp } from '@react-navigation/native';
import GroupCard from '../components/GroupCard';
import { vehicleServices, VehicleGroupApi } from '../services/vehicleServices';
import { theme } from '../theme';
import { VehicleListSelectedGroup } from './VehicleListScreen';
import { RootStackParamList } from '../navigation/RootNavigator';
import { EBusinessVertical } from '../types/common';

export type Group = {
  id: string;
  title: string;
  subtitle: string;
  vehicleId: number;
  imgIndex: number;
  image: string;
  type?: string;
  businessVertical?: EBusinessVertical;
};

export type SelectGroupScreenProps = {
  onSelect?: (group: Group & { businessVertical?: EBusinessVertical }) => void;
  businessVertical?: EBusinessVertical;
};

export default function SelectGroupScreen({
  onSelect,
  businessVertical,
}: SelectGroupScreenProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<VehicleListSelectedGroup | null>(null);

  const fetchGroups = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await vehicleServices.getGroups(businessVertical);
      const mapped: Group[] = (data || []).map((g: VehicleGroupApi) => ({
        id: g.id,
        title: g.title,
        subtitle: `Vehicles: ${g.total_vehicles}`,
        image: g.image,
        vehicleId: g.vehicleId,
        imgIndex: g.imgIndex,
        type: g.type,
      }));
      setGroups(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to load groups');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log('shud call api', businessVertical);
    fetchGroups();
  }, [businessVertical]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups(true);
  };

  // Navigation-based flow: VehicleListScreen is shown via stack navigation, not inline

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.stateText, { color: colors.text }]}>
            Loading groups…
          </Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateContainer}>
          <Text style={[styles.stateText, { color: theme.colors.error }]}>
            {error}
          </Text>
          <Text style={[styles.stateText, { color: colors.text }]}>
            Pull to retry.
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        style={{ marginBottom: 100 }}
        data={groups}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
        renderItem={({ item }) => (
          <GroupCard
            title={item.title}
            vehicleId={item.vehicleId}
            imgIndex={item.imgIndex}
            subtitle={item.subtitle}
            image={item.image}
            onPress={() => {
              const groupParam = { id: item.id, title: item.title, subtitle: item.subtitle, type: item.type, businessVertical } as any;
              console.log('eheck group', groupParam)
              if (businessVertical === EBusinessVertical.BANK) {
                navigation.navigate('SelectBucket', { group: groupParam });
              } else {
                navigation.navigate('VehicleList', { group: groupParam });
              }
              if (onSelect) onSelect({ ...item, businessVertical });
            }}
          />
        )}
      />
    );
  };

  return (
    <View style={[styles.container, { marginBottom: -30 }]}>      
      {businessVertical == 'A' && (
        <Text style={[styles.header, { color: colors.text }]}>        
          Insurance Auctions
        </Text>
      )}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 24,
    fontFamily: theme.fonts.bold,
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  stateText: {
    marginTop: 12,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
  },
});
