import axios from 'axios';
import { Platform } from 'react-native';
import { Config } from '../config';

console.log('cehck config', Config.apiUrl)
// Resolve base URL considering Android emulator localhost mapping
function resolveBaseUrl(): string {
  const PORT = 4000;

  if (Platform.OS === 'android') {
    return __DEV__
      ? `http://10.0.2.2:${PORT}` // Android Emulator
      : `${Config.apiUrl}`; // Android Device
  } else {
    return __DEV__
      ? `http://localhost:${PORT}` // iOS Simulator
      : `${Config.apiUrl}`; // iPhone Device
  }
}

// Ensure no accidental double letters or trailing slashes
export const API_BASE_URL = `${resolveBaseUrl().replace(/\/$/, '')}/kmsg/buyer/vehicles`;

export type VehicleGroupApi = {
  id: string;
  title: string;
  vehicleId: number;
  imgIndex: number;
  total_vehicles: string | number;
  image: string;
  type?: string;
};

export type VehicleApi = {
  vehicle_id: string;
  end_time: string;
  odometer: string | number;
  vehicleId: number;
  imgIndex: number;
  fuel: string;
  owner_serial: string | number;
  state_rto: string;
  make: string;
  model: string;
  variant: string;
  manufacture_year: string | number;
  main_image: string;
  status: 'Winning' | 'Losing';
  is_favorite?: boolean;
  manager_name: string;
  manager_phone: string;
};

export const vehicleServices = {
  async getGroups(): Promise<VehicleGroupApi[]> {
    try {
      const url = `${API_BASE_URL}/groups`;
      console.log('[vehicleServices.getGroups] url:', url);

      const res = await axios.get(url);
    console.log('check res', res.data)

      return res.data as VehicleGroupApi[];
    } catch (error: any) {
      if (error?.response) {
        console.log('[vehicleServices.getGroups] HTTP error', error.response.status, error.response.data);
      } else if (error?.request) {
        console.log('[vehicleServices.getGroups] No response received', String(error?.message || error));
      } else {
        console.log('[vehicleServices.getGroups] Request setup error', String(error?.message || error));
      }
      throw error;
    }
  },

  async getVehiclesByGroup(params: { type: string; title: string }): Promise<VehicleApi[]> {
    const { type, title } = params;
    const url = `${API_BASE_URL}/groups/list`;
    const res = await axios.get(url, {
      params: { type, title },
    });
    console.log('check res', res.data)
    return res.data as VehicleApi[];
    console.log('[vehicleServices.getVehiclesByGroup] url:', `${url}?type=${params.type}&title=${params.title}`);
    try {
      console.log('checking the url', `${url}?type=${type}&title=${title}`);
    } catch (error: any) {
      if (error?.response) {
        console.log('[vehicleServices.getVehiclesByGroup] HTTP error', error.response.status, error.response.data);
      } else if (error?.request) {
        console.log('[vehicleServices.getVehiclesByGroup] No response received', String(error?.message || error));
      } else {
        console.log('[vehicleServices.getVehiclesByGroup] Request setup error', String(error?.message || error));
      }
      throw error;
    }
  },
};
