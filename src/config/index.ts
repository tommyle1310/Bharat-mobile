import { Platform } from 'react-native';
import { theme } from '../theme';
import { API_URL, DIR_BASE, DIR_CASE_OPTION, DIR_BUYER, DIR_REGION, DIR_VEHICLE } from '@env';
console.log('check config file ', API_URL)
export const Config = {
  apiUrl: API_URL || 'http://192.168.1.13:4000/kmsg/buyer',
  dirBase: DIR_BASE || 'data-files',
  dirVehicle: DIR_VEHICLE || 'vehicle',
  dirBuyer: DIR_BUYER || 'buyer',
  dirRegion: DIR_REGION || 'region',
  dirCaseOption: DIR_CASE_OPTION || 'case_option',
  platform: Platform.OS,
  theme
};


export type AppConfig = typeof Config;


