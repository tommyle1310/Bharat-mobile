/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { StatusBar, StyleSheet, Text, useColorScheme, View, Button } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SelectGroupScreen from './src/screens/SelectGroupScreen';
import VehicleListScreen from './src/screens/VehicleListScreen';

type RootStackParamList = {
  SelectGroup: undefined;
  VehicleList: { groupId: string; title: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function SelectGroupWrapper({ navigation }: { navigation: any }) {
  return (
    <SelectGroupScreen
      onSelect={(group) =>
        navigation.navigate('VehicleList', { groupId: group.id, title: group.title })
      }
    />
  );
}

function VehicleListWrapper({ route }: { route: any }) {
  return <VehicleListScreen />;
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack.Navigator initialRouteName="SelectGroup">
          <Stack.Screen name="SelectGroup" component={SelectGroupWrapper} options={{ title: 'Insurance Auctions', headerShown: false }} />
          <Stack.Screen name="VehicleList" component={VehicleListWrapper} options={({ route }) => ({ title: route.params?.title ?? 'Vehicles' })} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    margin: 16,
  },
  preview: {
    flex: 1,
  },
});

export default App;
