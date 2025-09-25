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
  apiUrl: API_URL || 'http://192.168.10.1:1310/kmsg/buyer',
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
    // Development mode: Handle emulator/simulator localhost
    if (Platform.OS === 'android') {
      // Android Emulator: Try multiple IP options
      // 10.0.2.2 is the special IP that Android emulator uses to access host machine
      // If that doesn't work, try the actual host IP
      const androidOptions = [
        `http://10.0.2.2:${PORT}`,  // Standard Android emulator host access
        `http://192.168.10.1:${PORT}`, // Your actual host IP
        `http://localhost:${PORT}`, // Fallback
      ];
      
      // For now, use 10.0.2.2 as primary
      return `http://10.0.2.2:${PORT}`;
    } else {
      // iOS Simulator
      return `http://localhost:${PORT}`;
    }
  }
  // Production mode: Use API_URL from .env
  return Config.apiUrl;
};

export type AppConfig = typeof Config;


