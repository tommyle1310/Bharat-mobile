import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';

export type HeaderType = 'master' | 'search' | 'secondary';

export type HeaderProps = {
  type: HeaderType;
  title?: string;
  subtitle?: string;
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onFilterPress?: () => void;
  onAddPress?: () => void;
  onInboxPress?: () => void;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  notificationCount?: number;
  avatarUri?: string;
  showNotificationBadge?: boolean;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: any;
};

const Header: React.FC<HeaderProps> = ({
  type,
  title,
  subtitle,
  onBackPress,
  onSearchPress,
  onFilterPress,
  onAddPress,
  onInboxPress,
  onNotificationPress,
  onAvatarPress,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search',
  notificationCount = 0,
  avatarUri,
  showNotificationBadge = true,
  rightIcon,
  onRightIconPress,
  style,
}) => {
  const navigation = useNavigation();
  const renderMasterHeader = () => (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.statusIcons}>
          <MaterialIcons name="signal-cellular-4-bar" size={16} color={theme.colors.textMuted} />
          <MaterialIcons name="wifi" size={16} color={theme.colors.textMuted} />
          <MaterialIcons name="battery-full" size={16} color={theme.colors.textMuted} />
        </View>
      </View>
      
      <View style={styles.mainContent}>
        <View style={styles.leftSection}>
          <Pressable onPress={onBackPress || (() => navigation.goBack())} style={styles.backButton}>
            <MaterialIcons name="chevron-left" size={24} color={theme.colors.textMuted} />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>
        
        <View style={styles.centerSection}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        
        <View style={styles.rightSection}>
          <Pressable onPress={onRightIconPress || onAddPress} style={styles.actionButton}>
            <MaterialIcons 
              name={rightIcon || "add"} 
              size={24} 
              color={theme.colors.primary} 
            />
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderSearchHeader = () => (
    <View style={styles.container}>
      <View style={styles.searchContent}>
        <Pressable onPress={onBackPress || (() => navigation.goBack())} style={styles.searchBackButton}>
          <MaterialIcons name="chevron-left" size={24} color={theme.colors.textMuted} />
        </Pressable>
        
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor={theme.colors.textMuted}
            value={searchValue}
            onChangeText={onSearchChange}
            editable={true}
            onFocus={onSearchPress}
          />
        </View>
        
        <Pressable onPress={onFilterPress} style={styles.filterButton}>
          <MaterialIcons name="tune" size={20} color={theme.colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );

  const renderSecondaryHeader = () => (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.time}>9:41</Text>
        <View style={styles.statusIcons}>
          <MaterialIcons name="signal-cellular-4-bar" size={16} color={theme.colors.textMuted} />
          <MaterialIcons name="wifi" size={16} color={theme.colors.textMuted} />
          <MaterialIcons name="battery-full" size={16} color={theme.colors.textMuted} />
        </View>
      </View>
      
      <View style={styles.mainContent}>
        <View style={styles.leftSection}>
          <Text style={styles.greeting}>{title}</Text>
        </View>
        
        <View style={styles.rightSection}>
          <Pressable onPress={onAddPress} style={styles.iconButton}>
            <MaterialIcons name="add-box" size={24} color={theme.colors.textMuted} />
          </Pressable>
          
          <Pressable onPress={onInboxPress} style={styles.iconButton}>
            <MaterialIcons name="inbox" size={24} color={theme.colors.textMuted} />
          </Pressable>
          
          <Pressable onPress={onNotificationPress} style={styles.notificationContainer}>
            <MaterialIcons name="notifications" size={24} color={theme.colors.textMuted} />
            {showNotificationBadge && notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>
                  {notificationCount > 9 ? '10+' : notificationCount.toString()}
                </Text>
              </View>
            )}
          </Pressable>
          
          <Pressable onPress={onAvatarPress} style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons name="person" size={24} color={theme.colors.textMuted} />
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => {
    switch (type) {
      case 'master':
        return renderMasterHeader();
      case 'search':
        return renderSearchHeader();
      case 'secondary':
        return renderSecondaryHeader();
      default:
        return renderMasterHeader();
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      {renderHeader()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: theme.radii.lg,
    borderBottomRightRadius: theme.radii.lg,
    ...theme.shadows.sm,
  },
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  time: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  backText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  greeting: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  searchBackButton: {
    padding: theme.spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    padding: 0,
  },
  filterButton: {
    padding: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.sm,
  },
  notificationContainer: {
    position: 'relative',
    padding: theme.spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.error,
    borderRadius: theme.radii.pill,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  notificationText: {
    color: theme.colors.textInverse,
    fontSize: theme.fontSizes.xs,
    fontWeight: '700',
  },
  avatarContainer: {
    marginLeft: theme.spacing.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.pill,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.pill,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Header;
