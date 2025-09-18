import api from '../config/axiosConfig';
import { Vehicle } from '../types/Vehicle';

export interface ToggleWatchlistResponse {
  message: string;
  is_favorite?: boolean;
  locked?: boolean;
}

export const watchlistService = {
  async getWatchlist(page?: number): Promise<{ data: Vehicle[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const res = await api.get('/watchlist', {
      params: { page: page || 1 }
    });
    return res.data.data;
  },

  async toggle(vehicleId: number): Promise<ToggleWatchlistResponse> {
    console.log('cehck vehicle id', vehicleId);
    const res = await api.post(`/watchlist/toggle`, { vehicle_id: vehicleId });
    return res.data.data as ToggleWatchlistResponse;
  },
};

export default watchlistService;


