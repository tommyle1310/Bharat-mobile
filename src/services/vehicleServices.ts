import { resolveBaseUrl } from "../config";
import axiosInstance from "../config/axiosConfig";

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
      const url = '/vehicles/groups'; // Base URL already includes /kmsg/buyer
      console.log('[vehicleServices.getGroups] Requesting:', resolveBaseUrl(), url);
      const response = await axiosInstance.get(url);
      console.log('[vehicleServices.getGroups] Response:', response.data);
      return response.data as VehicleGroupApi[];
    } catch (error) {
      // Error handling is done in axiosConfig interceptor
      throw error;
    }
  },

  async getVehiclesByGroup(params: { type: string; title: string }): Promise<VehicleApi[]> {
    try {
      const url = '/vehicles/groups/list'; // Base URL already includes /kmsg/buyer
      console.log('[vehicleServices.getVehiclesByGroup] Requesting:', `${url}?type=${params.type}&title=${params.title}`);
      const response = await axiosInstance.get(url, {
        params: { type: params.type, title: params.title },
      });
      console.log('[vehicleServices.getVehiclesByGroup] Response:', response.data);
      return response.data as VehicleApi[];
    } catch (error) {
      // Error handling is done in axiosConfig interceptor
      throw error;
    }
  },
};