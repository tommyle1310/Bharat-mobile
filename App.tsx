/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { StoreProvider } from './src/providers/StoreProvider';
import { ToastProvider } from './src/components';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ToastProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'light-content'} />
          <RootNavigator />
        </ToastProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
export default App;
