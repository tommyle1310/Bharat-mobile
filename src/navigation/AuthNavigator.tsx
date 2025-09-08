import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { LoginScreen, SignupScreen, OTPScreen } from '../screens/auth';
import PanScreen from '../screens/auth/PanScreen';
import AdhaarScreen from '../screens/auth/AdhaarScreen';
import TermsnConditionsScreen from '../screens/auth/TermsnConditionsScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  OTP: undefined;
  Tabs: undefined;
  Pan: undefined;
  Adhaar: undefined;
  TermsnConditions: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="Pan" component={PanScreen} />
      <Stack.Screen name="Adhaar" component={AdhaarScreen} />
      <Stack.Screen name="TermsnConditions" component={TermsnConditionsScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
