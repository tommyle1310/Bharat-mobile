import { Platform } from 'react-native';
import { theme } from '../theme';
import { API_URL } from '@env';

export const Config = {
  apiUrl: API_URL || 'https://example.com',
  platform: Platform.OS,
  theme
};

export type AppConfig = typeof Config;


