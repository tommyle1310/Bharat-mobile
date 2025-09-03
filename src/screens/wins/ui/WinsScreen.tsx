import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Tab from '../../../components/Tab';
import { theme } from '../../../theme';

const Section = ({ title, color, onPress, children }: { title: string; color: string; onPress?: () => void; children: React.ReactNode }) => (
  <Pressable onPress={onPress} style={styles.card}>
    <View style={[styles.headerRow]}>
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{title}</Text>
      </View>
    </View>
    <View style={styles.body}>{children}</View>
  </Pressable>
);

const WinsScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedTab, setSelectedTab] = useState('approval');

  const tabOptions = [
    { label: 'Approval Pending', value: 'approval' },
    { label: 'Payment Pending', value: 'payment' },
    { label: 'Completed', value: 'completed' },
  ];

  const navToDetail = () => navigation.navigate('VehicleDetail', { vehicle: {
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
    title: 'Honda BRIO 1.2 VX AT (2015)',
    kms: '45,000 km',
    fuel: 'CNG',
    owner: '2nd Owner',
    region: 'HR',
    status: 'Winning',
    manager_name: 'Ramesh Tyagi',
    manager_phone: '978988132'
  } });

  const renderContent = () => {
    switch (selectedTab) {
      case 'approval':
        return (
          <Section title="Approval Pending" color={theme.colors.warning} onPress={navToDetail}>
            <Text style={styles.lineTitle}>Honda BRIO 1.2 VX AT (2015)</Text>
            <Text style={styles.line}>24-Aug-2025        3,45,000/-</Text>
            <Text style={styles.lineAlt}>Ramesh Tyagi - 978988132</Text>
          </Section>
        );
      case 'payment':
        return (
          <Section title="Payment Pending" color={theme.colors.error} onPress={navToDetail}>
            <Text style={styles.lineTitle}>Honda BRIO 1.2 VX AT (2015)</Text>
            <Text style={styles.line}>24-Aug-2025        3,45,000/-</Text>
            <Text style={styles.lineAlt}>Approved On 26-Aug-2025</Text>
            <Text style={styles.lineAlt}>Ramesh Tyagi - 978988132</Text>
          </Section>
        );
      case 'completed':
        return (
          <Section title="Completed" color={theme.colors.success} onPress={navToDetail}>
            <Text style={styles.lineTitle}>Honda BRIO 1.2 VX AT (2015)</Text>
            <Text style={styles.line}>24-Aug-2025        3,45,000/-</Text>
            <Text style={styles.lineAlt}>Approved On 26-Aug-2025</Text>
            <Text style={styles.lineAlt}>Ramesh Tyagi - 978988132</Text>
          </Section>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Tab 
        options={tabOptions} 
        selectedValue={selectedTab} 
        onValueChange={setSelectedTab}
        style={styles.tabContainer}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContainer: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  scrollContent: { 
    padding: theme.spacing.lg, 
    paddingBottom: 40 
  },
  card: {
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    ...theme.shadows.md,
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: theme.spacing.sm 
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    borderBottomRightRadius: theme.radii.lg,
    marginBottom: theme.spacing.md,
  },
  badgeText: { 
    color: theme.colors.textInverse, 
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
  },
  body: { 
    paddingHorizontal: theme.spacing.xs 
  },
  lineTitle: { 
    fontSize: theme.fontSizes.md, 
    fontWeight: '700', 
    marginBottom: theme.spacing.sm, 
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  line: { 
    fontSize: theme.fontSizes.sm, 
    marginBottom: theme.spacing.xs, 
    color: theme.colors.text,
    fontFamily: theme.fonts.regular,
  },
  lineAlt: { 
    fontSize: theme.fontSizes.sm, 
    color: theme.colors.textSecondary, 
    marginBottom: theme.spacing.xs,
    fontFamily: theme.fonts.regular,
  }
});

export default WinsScreen;


