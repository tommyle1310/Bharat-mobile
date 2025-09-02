import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS: Record<string, string> = {
  Home: 'ribbon-outline',
  Watchlist: 'search-outline',
  Bids: 'chatbubble-ellipses-outline',
  Wins: 'trophy-outline',
  Wishlist: 'reorder-three-outline'
};

const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Watchlist: 'Watchlist',
  Bids: 'Bids',
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

        if (isFocused) {
          return (
            <TouchableOpacity key={route.key} accessibilityRole="button" onPress={onPress} style={styles.pillButton}>
              <Icon name={TAB_ICONS[route.name]} size={22} color={theme.colors.card} />
              <Text style={styles.pillLabel}>{TAB_LABELS[route.name] || route.name}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.key} accessibilityRole="button" onPress={onPress} style={styles.tabItem}>
            <Icon
              name={TAB_ICONS[route.name]}
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
    left: 16,
    right: 16,
    bottom: 14,
    backgroundColor: '#000',
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
    marginLeft: 10,
    color: theme.colors.card,
    fontWeight: '700',
  }
});

export default BottomTabBar;


