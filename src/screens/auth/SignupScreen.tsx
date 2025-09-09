import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme';
import { Input, Button, Select, useToast } from '../../components';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { SelectOption } from '../../components/Select';
import Icon from 'react-native-vector-icons/MaterialIcons';
import authService, { RegisterPayload } from '../../services/authService';
import api from '../../config/axiosConfig';

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

  const categories: SelectOption[] = [
    { label: 'Insurance', value: '10' },
    { label: 'Banking', value: '20' },
  ];

  const [formData, setFormData] = useState({
    name: '',
    phoneNo: '',
    email: '',
    password: '',
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
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
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

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const result = await authService.register({        
          category: parseInt(formData.category.toString()),
          phone: formData.phoneNo,
          password: formData.password,
          email: formData.email,
          state_id: formData.state,
          city_id: parseInt(formData.city),
          pin_number: formData.pin,
          company_name: formData.company,
          aadhaar_number: formData.aadhaarNo,
          pan_number: formData.pan,
          address: formData.address,
          name: formData.name,
        } as RegisterPayload);
        show('Registration successful', 'success');
      } catch (error) {
        const err: any = error;
        const status = err?.response?.status;
        const url = `${err?.config?.baseURL || ''}${err?.config?.url || ''}`;
        const serverMessage = err?.response?.data?.message;
        const details = serverMessage || err?.message || 'Registration failed';
        show(`${status ? status + ' - ' : ''} : ''}`, 'error');
      }
      // Handle form submission
    }
  };

  const handleUpload = (field: string) => {
    console.log(`Upload ${field} document`);
    // Handle document upload
    if (field === 'aadhaar') {
      navigation.navigate('Adhaar');
    } else if (field === 'pan') {
      navigation.navigate('Pan');
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>KMSG</Text>
          <Text style={styles.logoSubtitle}>Mobile</Text>
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Fill in your details to create a new account
        </Text>

        {/* Form Fields */}
        <Input
          label="Name"
          placeholder="Name"
          value={formData.name}
          onChangeText={value => handleInputChange('name', value)}
          error={errors.name}
        />

        <Input
          label="Phone No."
          placeholder="Phone No."
          value={formData.phoneNo}
          onChangeText={value => handleInputChange('phoneNo', value)}
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.phoneNo}
        />

        <Input
          label="Email"
          placeholder="Email"
          value={formData.email}
          onChangeText={value => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Password"
          placeholder="Password"
          value={formData.password}
          onChangeText={value => handleInputChange('password', value)}
          keyboardType="default"
          maxLength={10}
          error={errors.password}
        />

        <Input
          label="Address"
          placeholder="Address"
          value={formData.address}
          onChangeText={value => handleInputChange('address', value)}
          error={errors.address}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Select
              label="State"
              placeholder="Select State"
              value={formData.state}
              options={stateOptions}
              onValueChange={value => handleInputChange('state', value)}
              error={errors.state}
            />
          </View>
          <View style={styles.halfWidth}>
            <Select
              label="City"
              placeholder="Select City"
              value={formData.city}
              options={cityOptions}
              onValueChange={value => handleInputChange('city', value)}
              error={errors.city}
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Select
              label="Category"
              placeholder="Select Category"
              value={formData.category.toString()}
              options={categories}
              onValueChange={value => handleInputChange('category', value)}
              error={errors.category}
            />
          </View>
        </View>

        <Input
          label="PIN"
          placeholder="PIN"
          value={formData.pin}
          onChangeText={value => handleInputChange('pin', value)}
          keyboardType="numeric"
          maxLength={6}
          error={errors.pin}
        />

        <Input
          label="Company Name"
          placeholder="Company Name"
          value={formData.company}
          onChangeText={value => handleInputChange('company', value)}
          error={errors.company}
        />

        <View style={styles.uploadContainer}>
          <View style={styles.uploadInput}>
            <Input
              label="Aadhaar No."
              placeholder="Aadhaar No."
              value={formData.aadhaarNo}
              onChangeText={value => handleInputChange('aadhaarNo', value)}
              keyboardType="numeric"
              maxLength={12}
              error={errors.aadhaarNo}
            />
          </View>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleUpload('aadhaar')}
          >
            <Icon name="cloud-upload" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.uploadContainer}>
          <View style={styles.uploadInput}>
            <Input
              label="PAN"
              placeholder="PAN"
              value={formData.pan}
              onChangeText={value => handleInputChange('pan', value)}
              autoCapitalize="characters"
              maxLength={10}
              error={errors.pan}
            />
          </View>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => handleUpload('pan')}
          >
            <Icon name="cloud-upload" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
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
    marginBottom: theme.spacing.sm,
    fontFamily: theme.fonts.bold,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontFamily: theme.fonts.regular,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  uploadInput: {
    flex: 1,
  },
  uploadButton: {
    width: 48,
    height: 48,
    borderColor: theme.colors.primary,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  uploadIcon: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.primary,
  },
  submitButton: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  footer: {
    alignItems: 'center',
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
