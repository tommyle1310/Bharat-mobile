import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  Platform,
  Modal as RNModal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import { images } from '../images';
import { useUser } from '../hooks/useUser';
import { Button } from './index';

export type HeaderType = 'master' | 'search' | 'secondary' | 'home';

export type HeaderProps = {
  type: HeaderType;
  title?: string;
  subtitle?: string;
  canGoBack?: boolean;
  onBackPress?: () => void;
  shouldRenderRightIcon?: boolean;
  onSearchPress?: () => void;
  onFilterPress?: () => void;
  onAddPress?: () => void;
  onInboxPress?: () => void;
  onFavoritePress?: () => void;
  onNotificationPress?: () => void;
  onAvatarPress?: () => void;
  searchValue?: string;
  isFiltering?: boolean;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  notificationCount?: number;
  avatarUri?: string;
  showNotificationBadge?: boolean;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: any;
  titleCenter?: boolean;
};

const Header: React.FC<HeaderProps> = ({
  type,
  title,
  subtitle,
  canGoBack = false,
  onBackPress,
  onFavoritePress,
  isFiltering = false,
  onSearchPress,
  onFilterPress,
  onAddPress,
  onInboxPress,
  shouldRenderRightIcon = true,
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
  titleCenter = false,
}) => {
  const navigation = useNavigation();
  const { username, email, logout } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const renderBackButton = () =>
    canGoBack ? (
      <Pressable
        onPress={onBackPress || (() => navigation.goBack())}
        style={styles.backButton}
      >
        <MaterialIcons
          name="chevron-left"
          size={24}
          color={theme.colors.textMuted}
        />
      </Pressable>
    ) : null;

  const renderRightIconButton = () =>
    shouldRenderRightIcon ? (
      <Pressable
        onPress={onRightIconPress || onAddPress}
        style={styles.backButton}
      >
        <MaterialIcons
          name={rightIcon || 'add'}
          size={24}
          color={theme.colors.textMuted}
        />
      </Pressable>
    ) : null;

  const renderMasterHeader = () => (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.backButtonContainer}>{renderBackButton()}</View>

        <View
          style={[
            styles.leftSection,
            (titleCenter || (!shouldRenderRightIcon && !canGoBack)) && { flex: 1, alignItems: 'center' },
          ]}
        >
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {/* Drawer is not shown for master header */}
    </View>
  );

  const renderSearchHeader = () => (
    <View style={styles.container}>
      <View style={styles.searchContent}>
        {canGoBack && (
          <Pressable
            onPress={onBackPress || (() => navigation.goBack())}
            style={styles.searchBackButton}
          >
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={theme.colors.textMuted}
            />
          </Pressable>
        )}

        <Pressable onPress={onSearchPress} style={styles.searchInputContainer}>
          <MaterialIcons
            name="search"
            size={20}
            color={theme.colors.textMuted}
          />
          {/* <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor={theme.colors.textMuted}
            value={searchValue}
            onChangeText={onSearchChange}
            editable={true}
            onFocus={onSearchPress}
          /> */}
        </Pressable>

        <Pressable onPress={onFilterPress} style={styles.filterButton}>
          <MaterialIcons name="tune" size={20} color={theme.colors.textMuted} />
          {isFiltering && <View style={styles.filterBadge}></View>}
        </Pressable>
      </View>
    </View>
  );

  const renderHomeHeader = () => (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.leftSection}>
          <View
            style={{
              borderRadius: theme.radii.sm,
              backgroundColor: theme.colors.primaryLight,
              width: 30,
              height: 30,
            }}
          >
            {/* <Image source={images.logo} style={{ width: 60, height: 60 }} /> */}
          </View>
          <Text style={styles.greeting}>{title}</Text>
        </View>

        <View style={styles.rightSection}>
          <Pressable onPress={() => navigation.navigate('Watchlist' as never)} style={[styles.iconButton, {backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.xs, borderRadius: theme.radii.sm }]}>
            <MaterialIcons
              name="favorite"
              size={14}
              color={theme.colors.white}
            />
          </Pressable>

          <Pressable
            onPress={onNotificationPress}
            style={styles.notificationContainer}
          >
            <MaterialIcons
              name="notifications"
              size={24}
              color={theme.colors.textMuted}
            />
            {showNotificationBadge && notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>
                  {notificationCount > 9 ? '10+' : notificationCount.toString()}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable onPress={() => {setDrawerOpen(true); console.log('check clicked')}} style={styles.avatarContainer}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialIcons
                  name="person"
                  size={24}
                  color={theme.colors.textMuted}
                />
              </View>
            )}
          </Pressable>
        </View>
      </View>
      <RNModal
        visible={drawerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={() => setDrawerOpen(false)} />
          <View style={styles.drawer}>
            <View style={{ alignItems: 'center', marginBottom: theme.spacing.md }}>
              <View style={[styles.avatarPlaceholder, { width: 64, height: 64 }] }>
                <MaterialIcons name="person" size={32} color={theme.colors.textMuted} />
              </View>
              <Text style={{ color: theme.colors.text, marginTop: theme.spacing.sm, fontWeight: '700' }}>{username || 'User'}</Text>
              <Text style={{ color: theme.colors.textMuted }}>{email || ''}</Text>
            </View>
            <View style={{ gap: theme.spacing.sm }}>
              <Pressable style={styles.drawerItem} onPress={() => { setDrawerOpen(false); (navigation as any).navigate('Watchlist'); }}>
                <MaterialIcons name="favorite" size={20} color={theme.colors.text} />
                <Text style={styles.drawerItemText}>Wishlist</Text>
              </Pressable>
              <Pressable style={styles.drawerItem}>
                <MaterialIcons name="settings" size={20} color={theme.colors.text} />
                <Text style={styles.drawerItemText}>Settings</Text>
              </Pressable>
            </View>
            <View style={{ flex: 1 }} />
            <Button title="Logout" variant="destructive" onPress={logout} />
          </View>
        </View>
      </RNModal>
    </View>
  );

  const renderHeader = () => {
    switch (type) {
      case 'master':
        return renderMasterHeader();
      case 'search':
        return renderSearchHeader();
      case 'home':
        return renderHomeHeader();
      default:
        return renderMasterHeader();
    }
  };

  return <View style={[styles.wrapper, style]}>{renderHeader()}</View>;
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
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  backButtonContainer: {
    marginRight: theme.spacing.md,
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
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 10,
    backgroundColor: theme.colors.primary,
    height: 10,
    borderRadius: theme.radii.pill,
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
    top: 0,
    right: 0,
    backgroundColor: theme.colors.warning,
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
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  drawer: {
    width: 280,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.radii.lg,
    borderBottomLeftRadius: theme.radii.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  drawerItemText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
});

export default Header;
