import { resolveBaseUrl } from '../config';
import axiosInstance from '../config/axiosConfig';
import { EBusinessVertical } from '../types/common';

export type VehicleGroupApi = {
  id: string;
  title: string;
  vehicleId?: number; // Optional for BANK vertical
  imgIndex?: number; // Optional for BANK vertical
  total_vehicles: string | number;
  image?: string; // Optional for BANK vertical
  type?: string;
};

export type BankBucketApi = {
  bucket_id: number;
  bucket_name: string;
  bucket_end_dttm: string; // ISO datetime
  state: string;
  vehicle_type: string;
  vehicles_count: number;
};

export type VehicleApi = {
  vehicle_id: string;
  end_time: string;
  odometer: string | number;
  vehicleId: number;
  imgIndex: number;
  fuel: string;
  img_extension: string;
  owner_serial: string | number;
  state_rto: string;
  transmissionType: string;
  rc_availability: boolean;
  repo_date: string;
  regs_no: string;
  make: string;
  model: string;
  variant: string;
  manufacture_year: string | number;
  main_image: string;
  status: 'Winning' | 'Losing';
  is_favorite?: boolean;
  manager_name: string;
  manager_phone: string;
  has_bidded: boolean;
  bidding_status: 'Winning' | 'Losing' | null;
  bid_amount?: string;
  manager_email?: string;
  manager_image?: string;
  manager_id?: string;
  yard_contact_person_name?: string | null;
  contact_person_contact_no?: string | null;
  yard_address?: string | null;
  yard_address_zip?: string | null;
  yard_city?: string | null;
  yard_state?: string | null;
};

export type BucketApi = {
  bucket_id: number;
  bucket_name: string;
  bucket_end_dttm: string; // ISO datetime
  state: string;
  vehicles_count: number;
};

export const vehicleServices = {
  async getGroups(businessVertical?: EBusinessVertical): Promise<VehicleGroupApi[]> {
    try {
      const url = '/vehicles/groups'; // Base URL already includes /kmsg/buyer
      const response = await axiosInstance.get(url, {
        params: { businessVertical },
      });
      return response.data.data as VehicleGroupApi[];
    } catch (error) {
      // Error handling is done in axiosConfig interceptor
      throw error;
    }
  },

  async getBankBuckets(businessVertical: EBusinessVertical): Promise<{ data: BankBucketApi[]; total: number; page: number; pageSize: number; totalPages: number }> {
    try {
      const url = '/vehicles/groups'; // Base URL already includes /kmsg/buyer
      const response = await axiosInstance.get(url, {
        params: { businessVertical },
      });
      return response.data.data;
    } catch (error) {
      // Error handling is done in axiosConfig interceptor
      throw error;
    }
  },

  async getVehiclesByBucket(params: {
    businessVertical: EBusinessVertical;
    bucketId: number;
    page?: number;
  }): Promise<{ data: VehicleApi[]; total: number; page: number; pageSize: number; totalPages: number }> {
    try {
      const url = '/vehicles/groups/list'; // Base URL already includes /kmsg/buyer
      
      const requestParams: any = {
        businessVertical: params.businessVertical,
        bucketId: params.bucketId,
        page: params.page || 1,
      };

      const response = await axiosInstance.get(url, {
        params: requestParams,
      });
      console.log('[vehicleServices.getVehiclesByBucket] Response:', response.data);
      return response.data.data;
    } catch (error) {
      // Error handling is done in axiosConfig interceptor
      throw error;
    }
  },

  async getVehiclesByGroup(params: {
    type: string;
    title: string;
    businessVertical: EBusinessVertical;
    page?: number;
    bucketId?: number;
  }): Promise<{ data: VehicleApi[]; total: number; page: number; pageSize: number; totalPages: number }> {
    try {
      const url = '/vehicles/groups/list'; // Base URL already includes /kmsg/buyer
      
      // For BANK vertical, use vehicle_type parameter instead of title
      const requestParams: any = {
        type: params.type,
        businessVertical: params.businessVertical,
        page: params.page || 1,
        ...(params.bucketId != null ? { bucketId: String(params.bucketId) } : {}),
      };

      if (params.businessVertical === EBusinessVertical.BANK) {
        // For BANK, use vehicle_type with the ID instead of title
        requestParams.vehicle_type = params.title; // This should be the ID (e.g., "30")
      } else {
        // For other verticals, use title
        requestParams.title = params.title;
      }

      const query = new URLSearchParams(requestParams).toString();
      const fullUrl = `${resolveBaseUrl()}${url}?${query}`;
      // Verbose request logging
      console.log('[vehicleServices.getVehiclesByGroup] Base URL:', resolveBaseUrl());
      console.log('[vehicleServices.getVehiclesByGroup] Relative URL:', url);
      console.log('[vehicleServices.getVehiclesByGroup] Params object:', requestParams);
      console.log('[vehicleServices.getVehiclesByGroup] Final URL:', fullUrl);
      
      const response = await axiosInstance.get(url, {
        params: requestParams,
      });
      console.log(
        '[vehicleServices.getVehiclesByGroup] Response:',
        response.data,
      );
      return response.data.data;
    } catch (error) {
      // Error handling is done in axiosConfig interceptor
      throw error;
    }
  },

  async getBucketsByGroup(params: {
    type: string; // e.g., 'state' or 'auction_status'
    title: string; // e.g., 'South'
    page?: number;
  }): Promise<{ data: BucketApi[]; total: number; page: number; pageSize: number; totalPages: number }> {
    try {
      const url = '/vehicles/buckets/by-group';
      console.log('[vehicleServices.getBucketsByGroup] Requesting:', `${url}?type=${params.type}&title=${params.title}&page=${params.page || 1}`);
      const response = await axiosInstance.get(url, {
        params: {
          type: params.type,
          title: params.title,
          page: params.page || 1,
        },
      });
      console.log('[vehicleServices.getBucketsByGroup] Response:', response.data);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
  async getVehicleImages(vehicleId: number) {
    console.log('check vehi id', vehicleId);
    const res = await axiosInstance.get(
      `/vehicles/lookup/vehicle-images?id=${vehicleId}`,
    );
    return res.data.data;
  },

  async getVehicleById(vehicleId: number): Promise<VehicleApi> {
    try {
      const url = `/vehicles/${vehicleId}`;
      console.log('[vehicleServices.getVehicleById] Requesting:', url);
      const response = await axiosInstance.get(url);
      console.log('[vehicleServices.getVehicleById] Response:', response.data);
      return response.data.data as VehicleApi;
    } catch (error) {
      console.error('[vehicleServices.getVehicleById] Error:', error);
      throw error;
    }
  },
};
