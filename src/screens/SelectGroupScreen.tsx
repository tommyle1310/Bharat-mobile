import React from 'react';
import { FlatList, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { useTheme } from '@react-navigation/native';
import GroupCard from '../components/GroupCard';

export type Group = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
};

export type SelectGroupScreenProps = {
  onSelect: (group: Group) => void;
};

export default function SelectGroupScreen({
  onSelect,
}: SelectGroupScreenProps) {
  const { colors } = useTheme();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const raw: Array<{
    id: string;
    title: string;
    total_vehicles: string;
    image: string;
  }> = require('../data/selectGroupScreen.json'); // api from be that consist 2 queries: regions (states table) and queries to retrieve remaining item
  const groups: Group[] = raw.map(g => ({
    id: g.id,
    title: g.title,
    subtitle: `Vehicles: ${g.total_vehicles}`,
    image: g.image,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>
        Insurance Auctions
      </Text>
      <FlatList
        data={groups}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <GroupCard
            title={item.title}
            subtitle={item.subtitle}
            image={item.image}
            onPress={() => onSelect(item)}
          />
        )}
      />
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
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
});
