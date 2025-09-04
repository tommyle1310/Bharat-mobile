import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '@react-navigation/native';
import GroupCard from '../components/GroupCard';
import { vehicleServices, VehicleGroupApi } from '../services/vehicleServices';
import { theme } from '../theme';

export type Group = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  type?: string;
};

export type SelectGroupScreenProps = {
  onSelect: (group: Group) => void;
};

export default function SelectGroupScreen({ onSelect }: SelectGroupScreenProps) {
  const { colors } = useTheme();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchGroups = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await vehicleServices.getGroups();
      const mapped: Group[] = (data || []).map((g: VehicleGroupApi) => ({
        id: g.id,
        title: g.title,
        subtitle: `Vehicles: ${g.total_vehicles}`,
        image: g.image,
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
    fetchGroups();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups(true);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.stateText, { color: colors.text }]}>Loading groups…</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateContainer}>
          <Text style={[styles.stateText, { color: theme.colors.error }]}>{error}</Text>
          <Text style={[styles.stateText, { color: colors.text }]}>Pull to retry.</Text>
        </View>
      );
    }
    return (
      <FlatList
      style={{marginBottom: 100}}
        data={groups}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
        renderItem={({ item }) => (
          <GroupCard
            title={item.title}
            subtitle={item.subtitle}
            image={item.image}
            onPress={() => onSelect(item)}
          />
        )}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Insurance Auctions</Text>
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
