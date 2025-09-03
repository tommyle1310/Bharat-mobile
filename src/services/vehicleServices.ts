import axios from 'axios';
import { Platform } from 'react-native';
import { Config } from '../config';

// backend ip: 192.168.1.13:4000

// Resolve base URL considering Android emulator localhost mapping
function resolveBaseUrl(): string {
  const LAN_IP = "192.168.1.13"; // đổi IP LAN thật của PC bạn
  const PORT = 4000;

  if (Platform.OS === "android") {
    return __DEV__
      ? "http://10.0.2.2:" + PORT // Android Emulator
      : `http://${LAN_IP}:${PORT}`; // Device thật
  } else {
    return __DEV__
      ? "http://localhost:" + PORT // iOS Simulator
      : `http://${LAN_IP}:${PORT}`; // iPhone thật
  }
}


const API_BASE_URL = `${resolveBaseUrl()}/kmsg/buyer/vehicles`;

export type VehicleGroupApi = {
  id: string;
  title: string;
  total_vehicles: string | number;
  image: string;
  type?: string;
};

export type VehicleApi = {
  vehicle_id: string;
  end_time: string;
  odometer: string | number;
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
      const res = await axios.get(url);
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

  async getVehiclesByGroup(params: { type: string; id: string }): Promise<VehicleApi[]> {
    const { type, id } = params;
    const url = `${API_BASE_URL}/groups/list`;
    try {
      console.log('checking the url', `${url}?type=${type}&id=${id}`);
      const res = await axios.get(url, {
        params: { type, id },
      });
      return res.data as VehicleApi[];
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
