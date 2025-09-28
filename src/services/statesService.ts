import axiosInstance from '../config/axiosConfig';

export interface State {
  id: number;
  state: string;
  region: string;
}

export interface StatesResponse {
  data: State[];
}

class StatesService {
  async getAllStates(): Promise<State[]> {
    try {
      const url = '/states'; // Base URL already includes /kmsg/buyer
      console.log('[statesService.getAllStates] Requesting:', url);
      const response = await axiosInstance.get(url);
      console.log('[statesService.getAllStates] Response:', response.data);
      return response.data.data as State[];
    } catch (error) {
      console.error('[statesService.getAllStates] Error:', error);
      // Error handling is done in axiosConfig interceptor
      throw error;
    }
  }
}

export default new StatesService();
