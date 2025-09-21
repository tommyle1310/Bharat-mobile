import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal as RNModal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme';
import { Input, Button, Select, useToast, FullScreenLoader } from '../../components';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { SelectOption } from '../../components/Select';
import authService, { RegisterPayload } from '../../services/authService';
import api from '../../config/axiosConfig';
import { images } from '../../images';

type SignupScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Signup'
>;

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { show } = useToast();

  // Dynamic options from API
  const [stateOptions, setStateOptions] = useState<SelectOption[]>([]);
  const [allCities, setAllCities] = useState<Array<{ city_id: number; state_id: number; city: string }>>([]);
  const [cityOptions, setCityOptions] = useState<SelectOption[]>([]);

  const [verticalInsurance, setVerticalInsurance] = useState(false);
  const [verticalBank, setVerticalBank] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phoneNo: '',
    email: '',
    address: '',
    state: '',
    city: '',
    pin: '',
    company: '',
    aadhaarNo: '',
    pan: '',
    category: 10,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    if (field === 'state') {
      const nextStateId = parseInt(value);
      if (!Number.isNaN(nextStateId)) {
        const filtered = allCities
          .filter(c => c.state_id === nextStateId)
          .map<SelectOption>(c => ({ label: c.city, value: String(c.city_id) }));
        setCityOptions(filtered);
      } else {
        setCityOptions([]);
      }
      setFormData(prev => ({ ...prev, city: '' }));
    }
  };

  const handleCitySelect = (value: string) => {
    if (!formData.state) {
      setErrors(prev => ({ ...prev, state: 'Please select a state first' }));
      return;
    }
    handleInputChange('city', value);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.phoneNo.trim()) {
      newErrors.phoneNo = 'Phone number is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    // password handled by another team
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.pin.trim()) {
      newErrors.pin = 'PIN is required';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }
    if (!formData.aadhaarNo.trim()) {
      newErrors.aadhaarNo = 'Aadhaar number is required';
    }
    if (!formData.pan.trim()) {
      newErrors.pan = 'PAN is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [thankYouVisible, setThankYouVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const businessVertical = verticalInsurance && verticalBank ? 'A' : verticalInsurance ? 'I' : verticalBank ? 'B' : '';

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        if (!businessVertical) {
          show('Select at least one business vertical', 'error');
          return;
        }
        setLoading(true);
        
        const payload = {
          name: formData.name,
          phone: formData.phoneNo,
          email: formData.email,
          address: formData.address,
          state_id: formData.state,
          city_id: parseInt(formData.city),
          pin_number: formData.pin,
          company_name: formData.company,
          aadhaar_number: formData.aadhaarNo,
          pan_number: formData.pan,
          business_vertical: businessVertical as any,
        };

        await authService.register(payload);
        setThankYouVisible(true);
      } catch (error) {
        const err: any = error;
        const status = err?.response?.status;
        const url = `${err?.config?.baseURL || ''}${err?.config?.url || ''}`;
        const serverMessage = err?.response?.data?.message;
        const details = serverMessage || err?.message || 'Registration failed';
        show(`${status ? status + ' - ' : ''}${details}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };


  // Load states and cities from API
  useEffect(() => {
    let isMounted = true;
    const loadStatesAndCities = async () => {
      try {
        const [statesRes, citiesRes] = await Promise.all([
          api.get('/states'),
          api.get('/cities'),
        ]);

        if (!isMounted) return;

        const states = (statesRes.data as Array<{ id: number; state: string }>).map<SelectOption>(s => ({
          label: s.state,
          value: String(s.id),
        }));
        setStateOptions(states);

        const cities = citiesRes.data as Array<{ city_id: number; state_id: number; city: string }>;
        setAllCities(cities);

        // Initialize city options if a state is already selected
        if (formData.state) {
          const filtered = cities
            .filter(c => c.state_id === parseInt(formData.state))
            .map<SelectOption>(c => ({ label: c.city, value: String(c.city_id) }));
          setCityOptions(filtered);
        }
      } catch (e) {
        console.error('Failed to load states/cities', e);
      }
    };
    loadStatesAndCities();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <FullScreenLoader visible={loading} />
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.logoContainer}>
          <Image source={images.logo} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>Create Account</Text>

        {/* Form Fields */}
        <Input
          placeholder="Name"
          value={formData.name}
          onChangeText={value => handleInputChange('name', value)}
          error={errors.name}
        />

        <Input
          placeholder="Phone No."
          value={formData.phoneNo}
          onChangeText={value => handleInputChange('phoneNo', value)}
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.phoneNo}
        />

        <Input
          placeholder="Email"
          value={formData.email}
          onChangeText={value => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          placeholder="Address"
          value={formData.address}
          onChangeText={value => handleInputChange('address', value)}
          error={errors.address}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Select
              placeholder="Select State"
              value={formData.state}
              options={stateOptions}
              onValueChange={value => handleInputChange('state', value)}
              error={errors.state}
            />
          </View>
          <View style={styles.halfWidth}>
            <Select
              placeholder="Select City"
              value={formData.city}
              options={cityOptions}
              onValueChange={handleCitySelect}
              error={errors.city}
            />
          </View>
        </View>
        <View style={[styles.row, { alignItems: 'center' }]}>
          <Text style={{ color: theme.colors.text, marginRight: theme.spacing.md, marginVertical: theme.spacing.md }}>Business Vertical</Text>
          <TouchableOpacity
            onPress={() => setVerticalInsurance(!verticalInsurance)}
            style={[styles.checkbox, verticalInsurance && styles.checkboxChecked]}
            activeOpacity={0.8}
          >
            {verticalInsurance && <Text style={styles.checkboxTick}>✓</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setVerticalInsurance(!verticalInsurance)}
            style={styles.checkboxLabelContainer}
            activeOpacity={0.7}
          >
            <Text style={styles.checkboxLabel}>Insurance</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setVerticalBank(!verticalBank)}
            style={[styles.checkbox, verticalBank && styles.checkboxChecked]}
            activeOpacity={0.8}
          >
            {verticalBank && <Text style={styles.checkboxTick}>✓</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setVerticalBank(!verticalBank)}
            style={styles.checkboxLabelContainer}
            activeOpacity={0.7}
          >
            <Text style={styles.checkboxLabel}>Bank</Text>
          </TouchableOpacity>
        </View>

        <Input
          placeholder="PIN"
          value={formData.pin}
          onChangeText={value => handleInputChange('pin', value)}
          keyboardType="numeric"
          maxLength={6}
          error={errors.pin}
        />

        <Input
          placeholder="Company Name"
          value={formData.company}
          onChangeText={value => handleInputChange('company', value)}
          error={errors.company}
        />

        <Input
          placeholder="Aadhaar No."
          value={formData.aadhaarNo}
          onChangeText={value => handleInputChange('aadhaarNo', value)}
          keyboardType="numeric"
          maxLength={12}
          error={errors.aadhaarNo}
        />

        <Input
          placeholder="PAN"
          value={formData.pan}
          onChangeText={value => handleInputChange('pan', value)}
          autoCapitalize="characters"
          maxLength={10}
          error={errors.pan}
        />

        <Button
          title="Submit"
          onPress={handleSubmit}
          style={styles.submitButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{' '}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('Login')}
            >
              Sign-In
            </Text>
          </Text>
          <Text style={styles.contactText}>
            Any issue? Contact us at 4444444444
          </Text>
        </View>
      </ScrollView>

      {/* Thank You Modal */}
      <RNModal transparent animationType="fade" visible={thankYouVisible} onRequestClose={() => setThankYouVisible(false)}>
        <View style={{ flex: 1, backgroundColor: theme.colors.overlay, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg }}>
          <View style={{ width: '100%', borderRadius: theme.radii.xl, backgroundColor: theme.colors.card, padding: theme.spacing.lg }}>
            <Text style={{ fontSize: theme.fontSizes.lg, fontWeight: '700', color: theme.colors.text, fontFamily: theme.fonts.bold, marginBottom: theme.spacing.md }}>Thank You</Text>
            <Text style={{ color: theme.colors.text }}>Thank You for your interest. Our team will contact you soon</Text>
            <View style={{ height: theme.spacing.lg }} />
            <Button title="Close" onPress={() => setThankYouVisible(false)} />
          </View>
        </View>
      </RNModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundWithLogo,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    // paddingTop: theme.spacing.xxl,
    // paddingBottom: theme.spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    // backgroundColor: 'red',
    maxHeight: 100,
    // marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: theme.fontSizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: theme.radii.xs,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    // marginRight: theme.spacing.xs,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxTick: {
    color: theme.colors.textInverse,
    fontWeight: '700',
  },
  checkboxLabel: {
    color: theme.colors.text,
    // marginRight: theme.spacing.sm,
  },
  checkboxLabelContainer: {
    marginRight: theme.spacing.lg,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  footer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  footerText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.regular,
  },
  linkText: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
    fontFamily: theme.fonts.medium,
  },
  contactText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontFamily: theme.fonts.regular,
  },
});

export default SignupScreen;
