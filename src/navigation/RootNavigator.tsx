import React from 'react';
import { NavigationContainer, DefaultTheme, Theme as NavTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { BottomTabBar } from './BottomTabBar';
import AuthNavigator from './AuthNavigator';
import HomeScreen from '../screens/home/ui/HomeScreen';
import WatchlistScreen from '../screens/watchlist/ui/WatchlistScreen';
import BidsScreen from '../screens/bids/ui/BidsScreen';
import WinsScreen from '../screens/wins/ui/WinsScreen';
import MoreScreen from '../screens/more/ui/MoreScreen';
import WishlistScreen from '../screens/wishlist/ui/WishlistScreen';
import VehicleDetailScreen from '../screens/VehicleDetailScreen';
import VehicleListScreen from '../screens/VehicleListScreen';
import { Group } from '../screens/SelectGroupScreen';
const Tab = createBottomTabNavigator();

export type RootStackParamList = {
  Auth: undefined;
  Tabs: undefined;
  VehicleList: { group?: {  type?: string; title?: string } };
  VehicleDetail: { vehicle?: any; id?: string };
  Wishlist: undefined;
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
      sceneContainerStyle: { backgroundColor: theme.colors.background },
    }}
    tabBar={(props) => <BottomTabBar {...props} />}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Watchlist" component={WatchlistScreen} />
    <Tab.Screen name="Bids" component={BidsScreen} />
    <Tab.Screen name="Wins" component={WinsScreen} />
    <Tab.Screen name="More" component={MoreScreen} />
  </Tab.Navigator>
);

export const RootNavigator = () => {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="VehicleList" component={VehicleListScreen} />
        <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
        <Stack.Screen name="Wishlist" component={WishlistScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;


