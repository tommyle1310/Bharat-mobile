import { View, Text } from 'react-native';
import React from 'react';
import { Header } from '../../components';

const ForgotPasswordScreen = () => {
  return (
    <View>
      <Header
        title="Forgot Password"
        canGoBack
        type="master"
        shouldRenderRightIcon={false}
      />
      <Text>ForgotPasswordScreen</Text>
    </View>
  );
};

export default ForgotPasswordScreen;
