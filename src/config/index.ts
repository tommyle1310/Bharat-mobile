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
console.log('API_URL:', API_URL);
// Debug environment loading

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

// local: 192.168.10.1
// test: 13.203.1.159
export const Config = {
  apiUrl: API_URL || 'http://testindus.kmsgtech.com:1310/kmsg/buyer',
  dirBase: DIR_BASE || 'data-files',
  dirVehicle: DIR_VEHICLE || 'vehicles',
  dirBuyer: DIR_BUYER || 'buyer',
  dirRegion: DIR_REGION || 'region',
  port: parseInt(PORT || '1310'),
  dirCaseOption: DIR_CASE_OPTION || 'case_option',
  platform: Platform.OS,
  theme,
};
console.log('Config', Config.apiUrl);
// Resolve base URL based on platform and environment
export const resolveBaseUrl = (): string => {
  const PORT = Config.port || 1310; 
  if (__DEV__) {
    // Development mode: Use the same host as authService
    // testindus.kmsgtech.com is the working test server
    return `http://testindus.kmsgtech.com:${PORT}`;
  }
  // Production mode: Use API_URL from .env
  return Config.apiUrl;
};

export type AppConfig = typeof Config;


