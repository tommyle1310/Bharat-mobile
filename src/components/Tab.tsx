import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../theme';

export type TabOption = {
  label: string;
  value: string;
};

export type TabProps = {
  options: TabOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: any;
};

const Tab: React.FC<TabProps> = ({ options, selectedValue, onValueChange, style }) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <Pressable
            key={option.value}
            onPress={() => onValueChange(option.value)}
            style={[styles.tab, isSelected && styles.selectedTab]}
          >
            <Text style={[styles.tabText, isSelected && styles.selectedTabText]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundSecondary,
    // borderRadius: theme.radii.md,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTab: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
  },
  selectedTabText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
  },
});

export default Tab;
