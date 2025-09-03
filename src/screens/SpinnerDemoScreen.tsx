import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { theme } from '../theme';
import { Spinner, Avatar } from '../components';

const SpinnerDemoScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLoading = () => {
    setIsLoading(!isLoading);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Component Demos</Text>
        
        {/* Spinner Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spinner Component</Text>
          <View style={styles.spinnerContainer}>
            <View style={styles.spinnerItem}>
              <Text style={styles.spinnerLabel}>Small (40px)</Text>
              <Spinner size={40} />
            </View>
            <View style={styles.spinnerItem}>
              <Text style={styles.spinnerLabel}>Medium (80px)</Text>
              <Spinner size={80} />
            </View>
            <View style={styles.spinnerItem}>
              <Text style={styles.spinnerLabel}>Large (120px)</Text>
              <Spinner size={120} />
            </View>
          </View>
          
          <Pressable style={styles.button} onPress={handleToggleLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Stop Loading' : 'Start Loading'}
            </Text>
          </Pressable>
          
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <Spinner size={100} />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
        </View>

        {/* Avatar Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avatar Component</Text>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarItem}>
              <Text style={styles.avatarLabel}>Small</Text>
              <Avatar size="sm" isEditable={true} title="Small Avatar" />
            </View>
            <View style={styles.avatarItem}>
              <Text style={styles.avatarLabel}>Medium</Text>
              <Avatar size="md" isEditable={true} title="Medium Avatar" />
            </View>
            <View style={styles.avatarItem}>
              <Text style={styles.avatarLabel}>Large</Text>
              <Avatar size="lg" isEditable={true} title="Large Avatar" />
            </View>
            <View style={styles.avatarItem}>
              <Text style={styles.avatarLabel}>Extra Large</Text>
              <Avatar size="xl" isEditable={true} title="XL Avatar" />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontFamily: theme.fonts.bold,
  },
  section: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    fontFamily: theme.fonts.semibold,
  },
  spinnerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.lg,
  },
  spinnerItem: {
    alignItems: 'center',
  },
  spinnerLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.medium,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  buttonText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    fontFamily: theme.fonts.semibold,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radii.lg,
  },
  loadingText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.md,
    marginTop: theme.spacing.md,
    fontFamily: theme.fonts.medium,
  },
  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
  avatarItem: {
    alignItems: 'center',
  },
  avatarLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.medium,
  },
});

export default SpinnerDemoScreen;
