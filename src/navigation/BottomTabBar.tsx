import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ImageBackgroundComponent } from 'react-native';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import IconFontisto from 'react-native-vector-icons/Fontisto';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconOcticons from 'react-native-vector-icons/Octicons';
import IconMaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS: Record<string, {name: string, icon: typeof IconIonicons | typeof IconFontisto | typeof IconOcticons | typeof IconMaterialIcons}> = {
  Home: {name: 'home', icon: IconFontisto},
  Watchlist: {name: 'favorite', icon: IconFontisto},
  // Bids removed
  Wins: {name: 'bag-check', icon: IconIonicons},
  Wishlist: {name: 'favorite', icon: IconMaterialIcons},
};

const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Watchlist: 'Watchlist',
  // Bids removed
  Wins: 'Wins',
  Wishlist: 'Wishlist'
};

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          } as any);
          const prevented = (event as unknown as { defaultPrevented?: boolean }).defaultPrevented;
          if (!isFocused && !prevented) {
            navigation.navigate(route.name);
          }
        };

        const IconComponent = TAB_ICONS[route.name].icon;
        const iconName = TAB_ICONS[route.name].name;

        if (isFocused) {
          return (
            <TouchableOpacity key={route.key} accessibilityRole="button" onPress={onPress} style={styles.pillButton}>
              <IconComponent name={iconName} size={22} color={theme.colors.card} />
              <Text style={styles.pillLabel}>{TAB_LABELS[route.name] || route.name}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.key} accessibilityRole="button" onPress={onPress} style={styles.tabItem}>
            <IconComponent
              name={iconName}
              size={24}
              color={theme.colors.tabIcon}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    bottom: theme.spacing.md,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderRadius: 32,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  tabItem: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 22,
    height: 56,
    borderRadius: 28,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  pillLabel: {
    marginLeft: 4,
    color: theme.colors.card,
    fontWeight: '700',
  }
});

export default BottomTabBar;


