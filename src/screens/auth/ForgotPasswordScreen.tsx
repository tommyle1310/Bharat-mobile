import { View, Text } from 'react-native';
import React, { useState } from 'react';
import { Header, Input, Button, FullScreenLoader, useToast } from '../../components';
import { theme } from '../../theme';
import authService from '../../services/authService';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;
const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { show } = useToast();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  const handleSend = async () => {
    if (!email) {
      show('Please enter your email', 'error');
      return;
    }
    setIsLoading(true);
    setSuccessMessage('');
    try {
      const res = await authService.forgotPassword(email);
      setSuccessMessage(res?.message || 'Please check your email.');
    } catch (error: any) {
      const status = error?.response?.status;
      const serverMessage = error?.response?.data?.message;
      const details = serverMessage || error?.message || 'Failed to send reset email';
      show(`${status ? status + ' - ' : ''}${details}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header
        title="Forgot Password"
        canGoBack
        type="master"
        shouldRenderRightIcon={false}
      />

      <View style={{ padding: theme.spacing.lg }}>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Button title="Send email reset password" onPress={handleSend} />

        {successMessage ? (
          <View style={{ marginTop: theme.spacing.lg }}>
            <Text style={{ color: theme.colors.success, marginTop: theme.spacing.lg, marginBottom: theme.spacing.md, textAlign: 'center' }}>
              {successMessage}
            </Text>
            {/* <Button title="Go back Home" onPress={() => navigation.navigate('Login')} /> */}
          </View>
        ) : null}
      </View>

      <FullScreenLoader visible={isLoading} />
    </View>
  );
};

export default ForgotPasswordScreen;
