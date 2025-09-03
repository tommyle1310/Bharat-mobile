import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../../theme';
import Header from '../../../components/Header';
import { Avatar, Button } from '../../../components';

type RootStackParamList = {
  Tabs: undefined;
  VehicleList: undefined;
  VehicleDetail: { vehicle?: any; id?: string };
  Wishlist: undefined;
  Auth: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type MenuItem = {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const MoreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);

  const handleImageChange = (imageUri: string) => {
    setProfileImage(imageUri);
    console.log('Profile image updated:', imageUri);
  };

  const menuSections: MenuSection[] = [
    {
      title: 'MY ACCOUNT',
      items: [
        {
          id: 'personal-info',
          title: 'Personal Information',
          icon: 'person',
          onPress: () => console.log('Personal Information pressed'),
        },
        {
          id: 'subscriptions',
          title: 'Subscriptions',
          icon: 'refresh',
          onPress: () => console.log('Subscriptions pressed'),
        },
        {
          id: 'purchase-history',
          title: 'Purchase History',
          icon: 'shopping-bag',
          onPress: () => console.log('Purchase History pressed'),
        },
        {
          id: 'notifications',
          title: 'Notifications',
          icon: 'notifications',
          onPress: () => console.log('Notifications pressed'),
        },
      ],
    },
    {
      title: 'SECURITY',
      items: [
        {
          id: 'change-password',
          title: 'Change Password',
          icon: 'lock',
          onPress: () => console.log('Change Password pressed'),
        },
        {
          id: 'biometrics',
          title: 'Biometrics',
          icon: 'fingerprint',
          onPress: () => console.log('Biometrics pressed'),
        },
        {
          id: 'security-question',
          title: 'Security Question',
          icon: 'security',
          onPress: () => console.log('Security Question pressed'),
        },
      ],
    },
    {
      title: 'REWARDS AND BENEFITS',
      items: [
        {
          id: 'wishlist',
          title: 'Wishlist',
          icon: 'favorite',
          onPress: () => {
            // Navigate to WishlistScreen
            navigation.navigate('Wishlist');
          },
        },
        {
          id: 'referral-program',
          title: 'Referral Program',
          icon: 'people',
          onPress: () => console.log('Referral Program pressed'),
        },
        {
          id: 'redeem',
          title: 'Redeem',
          icon: 'card-giftcard',
          onPress: () => console.log('Redeem pressed'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
 
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Avatar
            url={profileImage}
            title="Profile Picture"
            isEditable={true}
            size="xl"
            onImageChange={handleImageChange}
          />
          <Text style={styles.profileName}>Aishat Adewale</Text>
          <Text style={styles.profileEmail}>aishat@gmail.com</Text>
        </View>


        {menuSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <Pressable
                  key={item.id}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && styles.menuItemWithBorder
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconContainer}>
                      <MaterialIcons name={item.icon as any} size={20} color={theme.colors.white} />
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={theme.colors.textMuted} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
        <View style={styles.logoutButton}>
          <Button variant='destructive' title="Logout" onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Auth' }] })} />
        </View>
      </ScrollView>
    </View>
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
  profileSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  profileName: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    fontFamily: theme.fonts.bold,
  },
  profileEmail: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.medium,
  },
  editButton: {
    paddingVertical: theme.spacing.xs,
  },
  editText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.primary,
    fontFamily: theme.fonts.medium,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: theme.fonts.medium,
  },
  menuCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  menuItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuItemText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
  },
  logoutButton: {
    marginBottom: 100,
  },
});

export default MoreScreen;
