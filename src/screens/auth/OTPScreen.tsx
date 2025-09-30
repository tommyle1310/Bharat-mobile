import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme';
import { NumericKeypad, Link, IconButton } from '../../components';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { images } from '../../images';
import WavyHeader from '../../components/WavyHeader';

type OTPScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OTP'>;

const OTPScreen: React.FC = () => {
  const navigation = useNavigation<OTPScreenNavigationProp>();
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(120); // 2 minutes
  const [canResendOtp, setCanResendOtp] = useState(false);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else {
      setCanResendOtp(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendOtp = () => {
    setCountdown(120);
    setCanResendOtp(false);
    // Here you would typically call your API to resend OTP
    console.log('Resending OTP...');
  };

  const handleContinue = () => {
    if (otp.length === 4) {
      console.log('OTP verified:', otp);
      // Handle OTP verification
      // Navigate to home for testing
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    }
  };

  const handleNumberPress = (number: string) => {
    if (otp.length < 4) {
      setOtp(prev => prev + number);
    }
  };

  const handleDeletePress = () => {
    setOtp(prev => prev.slice(0, -1));
  };

  const handleConfirmPress = () => {
    if (otp.length === 4) {
      handleContinue();
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Smaller Header with Logo and Wavy Bottom */}
      <WavyHeader logo={images.logo} height={200} />
      
      {/* Floating Back Button */}
      <IconButton
        icon="arrow-back"
        onPress={() => navigation.navigate('Login')}
        style={styles.backButton}
        color={theme.colors.text}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Enter OTP to <Text style={styles.highlightText}>Verify</Text> Your Identity
        </Text>
        
        <Text style={styles.subtitle}>
          A one-time password (OTP) has been sent to your registered email or phone number.
        </Text>

        {/* OTP Display */}
        <View style={styles.otpDisplay}>
          {Array.from({ length: 4 }, (_, index) => (
            <View key={index} style={[
              styles.otpDigit,
              otp[index] && styles.otpDigitFilled,
            ]}>
              <Text style={[
                styles.otpDigitText,
                otp[index] && styles.otpDigitTextFilled,
              ]}>
                {otp[index] || ''}
              </Text>
            </View>
          ))}
        </View>

        <NumericKeypad
          onNumberPress={handleNumberPress}
          onDeletePress={handleDeletePress}
          onConfirmPress={handleConfirmPress}
          otpValue={otp}
          maxLength={4}
        />

        <View style={styles.linkContainer}>
          <Link
            title={`Resend code in ${formatCountdown(countdown)}`}
            onPress={handleResendOtp}
            disabled={!canResendOtp}
            textAlign="center"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  headerLogo: {
    width: theme.spacing.md,
    height: theme.spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.veryLarge,
  },
  backButton: {
    position: 'absolute',
    top: 50, // Fixed position like LoginScreen
    left: theme.spacing.lg,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.radii.xl,
    padding: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  title: {
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
  subtitle: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
  otpDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  otpDigit: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
  },
  otpDigitFilled: {
    borderColor: theme.colors.primary,
    borderWidth: 1
    // backgroundColor: theme.colors.primaryLight,
  },
  otpDigitText: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '600',
    color: theme.colors.textMuted,
    fontFamily: theme.fonts.semibold,
  },
  otpDigitTextFilled: {
    color: theme.colors.primary,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  additionalContent: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  additionalText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.semibold,
  },
  additionalSubtext: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: theme.fonts.regular,
  },
});

export default OTPScreen;
