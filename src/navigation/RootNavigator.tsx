import React from 'react';
import { NavigationContainer, DefaultTheme, Theme as NavTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { BottomTabBar } from './BottomTabBar';
import AuthNavigator from './AuthNavigator';
import { useUserStore } from '../stores/userStore';
import HomeScreen from '../screens/home/ui/HomeScreen';
import WatchlistScreen from '../screens/watchlist/ui/WatchlistScreen';
// Removed BidsScreen; merged into Watchlist
import WinsScreen from '../screens/wins/ui/WinsScreen';
// Removed MoreScreen tab
import WishlistScreen from '../screens/wishlist/ui/WishlistScreen';
import SearchScreen from '../screens/search/ui/SearchScreen';
import VehicleDetailScreen from '../screens/VehicleDetailScreen';
import VehicleListScreen from '../screens/VehicleListScreen';
import { Group } from '../screens/SelectGroupScreen';
import VehicleImagesScreen from './VehicleImagesCaroselScreen';
const Tab = createBottomTabNavigator();

export type RootStackParamList = {
  Auth: undefined;
  Tabs: undefined;
  Search: { group?: {  type?: string; title?: string } };
  VehicleList: { group?: {  type?: string; title?: string, businessVertical?: any } };
  VehicleDetail: { vehicle?: any; id?: string };
  Wishlist: undefined;
  VehicleImages: { id: number };
};
const Stack = createNativeStackNavigator();


const navTheme: NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
    card: theme.colors.card,
    text: theme.colors.text,
    border: theme.colors.border,
    primary: theme.colors.primary,
    notification: theme.colors.primary
  }
};

const Tabs = () => (
  <Tab.Navigator
    initialRouteName="Home"
    screenOptions={{
      headerShown: false,
      tabBarStyle: { position: 'absolute' },
      tabBarShowLabel: false,
    }}
    tabBar={(props) => <BottomTabBar {...props} />}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Watchlist" component={WatchlistScreen} />
    {/* Bids removed */}
    <Tab.Screen name="Wins" component={WinsScreen} />
    <Tab.Screen name="Wishlist" component={WishlistScreen} />
  </Tab.Navigator>
);

export const RootNavigator = () => {
  const { isAuthenticated } = useUserStore();

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Authenticated user screens
          <>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="VehicleList" component={VehicleListScreen} />
            <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
            <Stack.Screen name="Wishlist" component={WishlistScreen} />
            <Stack.Screen name="VehicleImages" component={VehicleImagesScreen} />
          </>
        ) : (
          // Unauthenticated user screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;


