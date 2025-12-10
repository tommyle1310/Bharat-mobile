import axiosInstance from '../config/axiosConfig';

export enum AuctionStatus {
  APPROVAL_PENDING = 'APPROVAL_PENDING',
  APPROVED = 'APPROVED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  COMPLETED = 'COMPLETED'
}

export const AUCTION_STATUS_ID_MAP: Record<AuctionStatus, number[]> = {
  [AuctionStatus.APPROVAL_PENDING]: [20],
  [AuctionStatus.APPROVED]: [30],
  [AuctionStatus.PAYMENT_PENDING]: [70],
  [AuctionStatus.COMPLETED]: [100, 120, 140]
};

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
  async getWinVehicles(page: number = 1, auctionStatus?: AuctionStatus): Promise<WinResponse> {
    try {
      const url = '/win'; // Base URL already includes /kmsg/buyer
      console.log('[winService.getWinVehicles] Requesting:', url);
      const params: any = { page };
      if (auctionStatus) {
        params.auction_status = auctionStatus;
      }
      const response = await axiosInstance.get(url, {
        params,
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
