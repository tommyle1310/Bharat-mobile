import { Platform } from 'react-native';
import { theme } from '../theme';

// Import environment variables
import { 
  API_URL, 
  DIR_BASE, 
  DIR_CASE_OPTION, 
  DIR_BUYER, 
  DIR_REGION, 
  DIR_VEHICLE, 
  PORT 
} from '@env';

// Debug environment loading
console.log('[Config] Raw env import test:', { API_URL, DIR_BASE, DIR_CASE_OPTION, DIR_BUYER, DIR_REGION, DIR_VEHICLE, PORT });

if (__DEV__) {
  console.log('[Config] API_URL:', API_URL);
  console.log('[Config] All env vars:', { API_URL, DIR_BASE, DIR_CASE_OPTION, DIR_BUYER, DIR_REGION, DIR_VEHICLE, PORT });
}

// Try alternative import method
try {
  const env = require('@env');
  console.log('[Config] Alternative import method:', env);
} catch (error) {
  console.log('[Config] Alternative import failed:', error);
}

// local: 192.168.1.13
// test: 13.203.1.159
export const Config = {
  apiUrl: API_URL || 'http://13.203.1.159:4000/kmsg/buyer',
  dirBase: DIR_BASE || 'data-files',
  dirVehicle: DIR_VEHICLE || 'vehicles',
  dirBuyer: DIR_BUYER || 'buyer',
  dirRegion: DIR_REGION || 'region',
  port: parseInt(PORT || '4000'),
  dirCaseOption: DIR_CASE_OPTION || 'case_option',
  platform: Platform.OS,
  theme,
};
console.log('Config', Config.apiUrl);
// Resolve base URL based on platform and environment
export const resolveBaseUrl = (): string => {
  const PORT = Config.port || 4000; 
  if (__DEV__) {
    // Development mode: Handle emulator/simulator localhost
    return Platform.OS === 'android'
      ? `http://13.203.1.159:${PORT}` // Android Emulator - use actual IP
      : `http://localhost:${PORT}`; // iOS Simulator
  }
  // Production mode: Use API_URL from .env
  return Config.apiUrl;
};

export type AppConfig = typeof Config;


