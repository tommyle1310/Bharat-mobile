import { Platform } from 'react-native';
import { theme } from '../theme';

// Import biến từ .env.{env} qua babel plugin react-native-dotenv
import { 
  API_URL, 
  DIR_BASE, 
  DIR_CASE_OPTION, 
  DIR_BUYER, 
  DIR_REGION, 
  DIR_VEHICLE, 
  PORT 
} from '@env';

// Log để debug
if (__DEV__) {
  console.log('[Config] API_URL:', API_URL);
}

export const Config = {
  apiUrl: API_URL || 'http://default-api-url:4000/kmsg/buyer',
  dirBase: DIR_BASE || 'data-files',
  dirVehicle: DIR_VEHICLE || 'vehicle',
  dirBuyer: DIR_BUYER || 'buyer',
  dirRegion: DIR_REGION || 'region',
  port: PORT || 4000,
  dirCaseOption: DIR_CASE_OPTION || 'case_option',
  platform: Platform.OS,
  theme,
};

// Resolve base URL based on platform and environment
export const resolveBaseUrl = (): string => {
  const PORT = Config.port || 4000; 
  if (__DEV__) {
    // Development mode: Handle emulator/simulator localhost
    return Platform.OS === 'android'
      ? `http://10.0.2.2:${PORT}` // Android Emulator
      : `http://localhost:${PORT}`; // iOS Simulator
  }
  // Production mode: Use API_URL from .env
  return Config.apiUrl;
};

export type AppConfig = typeof Config;


