import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme';
import { Input, Button, OTPInput, Link, IconButton } from '../../components';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

type LoginMode = 'phone' | 'password' | 'otp';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [mode, setMode] = useState<LoginMode>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(120); // 2 minutes
  const [canResendOtp, setCanResendOtp] = useState(false);

  useEffect(() => {
    let timer: any;
    if (mode === 'otp' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResendOtp(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, mode]);

  const handlePasswordMode = () => {
    setMode('password');
    setCountdown(120);
    setCanResendOtp(false);
  };

  const handleOtpMode = () => {
    setMode('otp');
    setCountdown(120);
    setCanResendOtp(false);
    navigation.navigate('OTP');
  };

  const handleResendOtp = () => {
    setCountdown(120);
    setCanResendOtp(false);
    // Here you would typically call your API to resend OTP
  };

  const handleLogin = () => {
    // Handle login logic based on mode
    console.log('Login with:', { mode, phoneNumber, username, password, otp });
    // Navigate to home for testing
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button for password mode */}
      {mode === 'password' && (
        <View style={styles.header}>
          <IconButton
            icon="chevron-back"
            onPress={() => setMode('phone')}
            style={styles.backButton}
            color={theme.colors.primary}
          />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>KMSG</Text>
          <Text style={styles.logoSubtitle}>Mobile</Text>
        </View>

        {/* Phone Number Input */}
        {mode === 'phone' && (
          <>
            <Text style={styles.title}>Get Started now</Text>
            <Text style={styles.subtitle}>
              Sign up for a new account or log in to your existing one to seamlessly browse, explore, and order your favorite meals.
            </Text>
            
            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <View style={styles.buttonContainer}>
              <Button
              iconType='ionicons'
                title="Password"
                icon="lock-closed"
                onPress={handlePasswordMode}
                style={styles.twothirdButton}
              />
              <Button
              iconType='ionicons'
                title="OTP"
                icon="finger-print"
                variant="outline"
                onPress={handleOtpMode}
                style={styles.oneThirdButton}
              />
            </View>

          <View style={styles.signupSection}>
            <Text >Don't have an account?</Text>
            <Link
              title="Sign up"
              onPress={() => navigation.navigate('Signup')}
              textAlign="center"
            />
          </View>            
          </>
        )}

        {/* Password Mode */}
        {mode === 'password' && (
          <>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.usernameText}>John Doe</Text>
            
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Login"
              onPress={handleLogin}
              style={styles.fullButton}
            />

            <View style={styles.linkContainer}>
              <Link
                title="Forgot Password?"
                onPress={() => console.log('Forgot password')}
                textAlign="right"
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  signupSection: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text,
    textAlign: 'center',
    gap: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.regular,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    position: 'absolute',
    top: theme.spacing.xxl,
    left: theme.spacing.lg,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    fontSize: theme.fontSizes.xxxl,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.fonts.bold,
  },
  logoSubtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.regular,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.bold,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
    fontFamily: theme.fonts.regular,
  },
  welcomeText: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  usernameText: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontFamily: theme.fonts.medium,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flex: 1
  },
  twothirdButton: {
    flex: 2,
  },
  fullButton: {
    marginTop: theme.spacing.lg,
  },
  oneThirdButton: {
    flex: 1,
  },
  linkButton: {
    marginTop: theme.spacing.md,
    backgroundColor: 'transparent',
  },
  otpTitle: {
    fontSize: theme.fontSizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  highlightText: {
    color: theme.colors.primary,
  },
  otpSubtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  linkContainer: {
    alignItems: 'flex-end',
    marginTop: theme.spacing.md,
  },
});

export default LoginScreen;
