import api from '../config/axiosConfig';

export interface ToggleWatchlistResponse {
  message: string;
  is_favorite?: boolean;
}

export const watchlistService = {
  async toggle(vehicleId: number): Promise<ToggleWatchlistResponse> {
    console.log('cehck vehicle id', vehicleId);
    const res = await api.post(`/watchlist/toggle`, { vehicle_id: vehicleId });
    return res.data as ToggleWatchlistResponse;
  },
};

export default watchlistService;


