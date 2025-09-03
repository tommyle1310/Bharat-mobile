import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import Header from './Header';
import { theme } from '../theme';

/**
 * Example usage of the Header component with different types
 * This file demonstrates how to use the Header component in various scenarios
 */
export const HeaderExamples = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Header Component Examples</Text>
      
      {/* Master Header Example */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Master Header</Text>
        <Header
          type="master"
          title="Notes"
          subtitle="📝"
          onBackPress={() => console.log('Back pressed')}
          rightIcon="add"
          onRightIconPress={() => console.log('Add pressed')}
        />
      </View>

      {/* Search Header Example */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Search Header</Text>
        <Header
          type="search"
          searchPlaceholder="Search vehicles..."
          onBackPress={() => console.log('Back pressed')}
          onSearchPress={() => console.log('Search pressed')}
          onFilterPress={() => console.log('Filter pressed')}
        />
      </View>

      {/* Secondary Header Example */}
      <View style={styles.example}>
        <Text style={styles.exampleTitle}>Secondary Header</Text>
        <Header
          type="secondary"
          title="Hey, Jane!"
          onAddPress={() => console.log('Add pressed')}
          onInboxPress={() => console.log('Inbox pressed')}
          onNotificationPress={() => console.log('Notification pressed')}
          onAvatarPress={() => console.log('Avatar pressed')}
          notificationCount={10}
          showNotificationBadge={true}
          avatarUri="https://example.com/avatar.jpg"
        />
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
});

export default HeaderExamples;
