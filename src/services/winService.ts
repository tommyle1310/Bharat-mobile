import axiosInstance from '../config/axiosConfig';

export interface WinVehicle {
  vehicle_id: string;
  end_time: string;
  odometer: string;
  fuel: string | null;
  owner_serial: string;
  state_code: string;
  has_bidded: boolean;
  make: string;
  model: string;
  variant: string;
  img_extension: string;
  transmissionType: string | null;
  rc_availability: boolean;
  repo_date: string | null;
  regs_no: string;
  is_favorite: boolean;
  manufacture_year: string;
  vehicleId: number;
  imgIndex: number;
  bidding_status: string;
  bid_amount: string;
  manager_name: string;
  manager_phone: string;
  manager_email: string;
  manager_image: string;
  manager_id: string;
}

export interface WinResponse {
  message: string;
  code: number;
  data: {
    data: WinVehicle[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

class WinService {
  async getWinVehicles(page: number = 1): Promise<WinResponse> {
    try {
      const url = '/win'; // Base URL already includes /kmsg/buyer
      console.log('[winService.getWinVehicles] Requesting:', url);
      const response = await axiosInstance.get(url, {
        params: { page },
      });
      console.log('[winService.getWinVehicles] Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[winService.getWinVehicles] Error:', error);
      // Error handling is done in axiosConfig interceptor
      throw error;
    }
  }
}

export default new WinService();
