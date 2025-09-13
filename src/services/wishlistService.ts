import api from '../config/axiosConfig';
import { Vehicle } from '../types/Vehicle';

export interface UpdateWishlistParams {
  vehicle_type?: string;
  vehicle_fuel?: string;
  ownership?: string;
  rc_available?: string;
  sellerId?: string;
  regstate?: string;
  make?: string;
  subcategoryIds?: string;
  stateIds?: string;
  categoryId?: string;
}

export interface UpdateWishlistResponse {
  success: boolean;
  updated: {
    vehicletype: number;
    make: number;
    seller: number;
    state: number;
    subcategory: number;
  };
}

export interface WishlistConfiguration {
  success: boolean;
  configuration: {
    state: number[];
    seller: number[];
    subcategory: number[];
    vehicleType: number[];
    make: number[];
  };
}

export interface State {
  id: number;
  state: string;
  region: string;
}

export interface VehicleMake {
  id: number;
  make_name: string;
}

export const wishlistService = {
  async getWishlist(): Promise<Vehicle[]> {
    const res = await api.get('/wishlist');
    return res.data as Vehicle[];
  },

  async getWishlistConfiguration(): Promise<WishlistConfiguration> {
    const res = await api.get('/wishlist/configuration');
    return res.data as WishlistConfiguration;
  },

  async getStates(): Promise<State[]> {
    const res = await api.get('/states');
    return res.data as State[];
  },

  async getVehicleMakes(): Promise<VehicleMake[]> {
    const res = await api.get('/vehicle-makes');
    return res.data as VehicleMake[];
  },

  async updateWishlist(params: UpdateWishlistParams): Promise<UpdateWishlistResponse> {
    const queryParams = new URLSearchParams();
    
    // Add parameters only if they exist and are not empty
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const url = `/update-wishlist?${queryParams.toString()}`;
    const res = await api.post(url);
    return res.data as UpdateWishlistResponse;
  },
};

export default wishlistService;
