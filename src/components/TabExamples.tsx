import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import Tab from './Tab';
import { theme } from '../theme';

/**
 * Example usage of the Tab component
 * This file demonstrates how to use the Tab component in various scenarios
 */
export const TabExamples = () => {
  const [selectedTab1, setSelectedTab1] = useState('day');
  const [selectedTab2, setSelectedTab2] = useState('pending');

  const timeOptions = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  const statusOptions = [
    { label: 'Approval Pending', value: 'pending' },
    { label: 'Payment Pending', value: 'payment' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Tab Component Examples</Text>
      
      {/* Time Period Tab Example */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Time Period Selection</Text>
        <Tab
          options={timeOptions}
          selectedValue={selectedTab1}
          onValueChange={setSelectedTab1}
        />
        <Text style={styles.selectedText}>
          Selected: {timeOptions.find(opt => opt.value === selectedTab1)?.label}
        </Text>
      </View>

      {/* Status Tab Example */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Status Selection</Text>
        <Tab
          options={statusOptions}
          selectedValue={selectedTab2}
          onValueChange={setSelectedTab2}
        />
        <Text style={styles.selectedText}>
          Selected: {statusOptions.find(opt => opt.value === selectedTab2)?.label}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    fontFamily: theme.fonts.bold,
  },
  example: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
  },
  exampleTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.medium,
  },
  selectedText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.regular,
  },
});

export default TabExamples;
