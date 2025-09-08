import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../theme';
import { Input, Button, Select } from '../../components';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { SelectOption } from '../../components/Select';
import Icon from 'react-native-vector-icons/MaterialIcons';


type SignupScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  
  // Sample data for states and cities
  const states: SelectOption[] = [
    { label: 'Maharashtra', value: 'maharashtra' },
    { label: 'Delhi', value: 'delhi' },
    { label: 'Karnataka', value: 'karnataka' },
    { label: 'Tamil Nadu', value: 'tamil_nadu' },
    { label: 'Telangana', value: 'telangana' },
    { label: 'Gujarat', value: 'gujarat' },
    { label: 'West Bengal', value: 'west_bengal' },
    { label: 'Uttar Pradesh', value: 'uttar_pradesh' },
  ];

  const cities: SelectOption[] = [
    { label: 'Mumbai', value: 'mumbai' },
    { label: 'Delhi', value: 'delhi' },
    { label: 'Bangalore', value: 'bangalore' },
    { label: 'Chennai', value: 'chennai' },
    { label: 'Hyderabad', value: 'hyderabad' },
    { label: 'Ahmedabad', value: 'ahmedabad' },
    { label: 'Kolkata', value: 'kolkata' },
    { label: 'Pune', value: 'pune' },
  ];

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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form submitted:', formData);
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
          onChangeText={(value) => handleInputChange('name', value)}
          error={errors.name}
        />

        <Input
          label="Phone No."
          placeholder="Phone No."
          value={formData.phoneNo}
          onChangeText={(value) => handleInputChange('phoneNo', value)}
          keyboardType="phone-pad"
          maxLength={10}
          error={errors.phoneNo}
        />

        <Input
          label="eMail"
          placeholder="eMail"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Address"
          placeholder="Address"
          value={formData.address}
          onChangeText={(value) => handleInputChange('address', value)}
          error={errors.address}
        />

        <View style={styles.row}>
          <View style={styles.halfWidth}>
            <Select
              label="State"
              placeholder="Select State"
              value={formData.state}
              options={states}
              onValueChange={(value) => handleInputChange('state', value)}
              error={errors.state}
            />
          </View>
          <View style={styles.halfWidth}>
            <Select
              label="City"
              placeholder="Select City"
              value={formData.city}
              options={cities}
              onValueChange={(value) => handleInputChange('city', value)}
              error={errors.city}
            />
          </View>
        </View>

        <Input
          label="PIN"
          placeholder="PIN"
          value={formData.pin}
          onChangeText={(value) => handleInputChange('pin', value)}
          keyboardType="numeric"
          maxLength={6}
          error={errors.pin}
        />

        <Input
          label="Company"
          placeholder="Company"
          value={formData.company}
          onChangeText={(value) => handleInputChange('company', value)}
          error={errors.company}
        />

        <View style={styles.uploadContainer}>
          <View style={styles.uploadInput}>
            <Input
              label="Aadhaar No."
              placeholder="Aadhaar No."
              value={formData.aadhaarNo}
              onChangeText={(value) => handleInputChange('aadhaarNo', value)}
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
              onChangeText={(value) => handleInputChange('pan', value)}
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
            <Text style={styles.linkText} onPress={() => navigation.navigate('Login')}>Sign-In</Text>
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
