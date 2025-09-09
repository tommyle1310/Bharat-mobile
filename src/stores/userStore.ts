import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle } from '../types/Vehicle';
import { authService } from '../services/authService';

export interface UserState {
  // User profile information
  category: number;
  username: string;
  email: string;
  avatar: string;
  token: string;
  refreshToken: string;
  buyerId?: number;
  
  // User lists
  watchList: Vehicle[];
  wins: Vehicle[];
  bids: Vehicle[];
  wishlist: Vehicle[];
  
  // Authentication state
  isAuthenticated: boolean;
  
  // Actions
  setCategory: (category: number) => void;
  setUsername: (username: string) => void;
  setEmail: (email: string) => void;
  setAvatar: (avatar: string) => void;
  setAuthTokens: (payload: { token: string; refreshToken: string; category: number }) => void;
  setBuyerId: (buyerId: number) => void;
  
  // List management actions
  addToWatchList: (vehicle: Vehicle) => void;
  removeFromWatchList: (vehicleId: string) => void;
  addToWins: (vehicle: Vehicle) => void;
  removeFromWins: (vehicleId: string) => void;
  addToBids: (vehicle: Vehicle) => void;
  removeFromBids: (vehicleId: string) => void;
  addToWishlist: (vehicle: Vehicle) => void;
  removeFromWishlist: (vehicleId: string) => void;
  
  // Authentication actions
  logout: () => Promise<void>;
  register: (userData: {
    category: number;
    username: string;
    email: string;
    avatar?: string;
  }) => void;
  refreshAuthToken: (newToken: string) => void;
  
  // Utility actions
  clearAllData: () => void;
  isVehicleInList: (vehicleId: string, listType: 'watchList' | 'wins' | 'bids' | 'wishlist') => boolean;
}

const initialState = {
  category: 10,
  username: '',
  email: '',
  avatar: '',
  token: '',
  refreshToken: '',
  buyerId: undefined as number | undefined,
  watchList: [],
  wins: [],
  bids: [],
  wishlist: [],
  isAuthenticated: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Profile setters
      setCategory: (category: number) => set({ category }),
      setUsername: (username: string) => set({ username }),
      setEmail: (email: string) => set({ email }),
      setAvatar: (avatar: string) => set({ avatar }),
      setBuyerId: (buyerId: number) => set({ buyerId }),

      setAuthTokens: ({ token, refreshToken, category }) => {
        set({ token, refreshToken, category, isAuthenticated: true });
      },
      
      // WatchList management
      addToWatchList: (vehicle: Vehicle) => {
        const { watchList } = get();
        if (!watchList.find(v => v.id === vehicle.id)) {
          set({ watchList: [...watchList, vehicle] });
        }
      },
      removeFromWatchList: (vehicleId: string) => {
        const { watchList } = get();
        set({ watchList: watchList.filter(v => v.id !== vehicleId) });
      },
      
      // Wins management
      addToWins: (vehicle: Vehicle) => {
        const { wins } = get();
        if (!wins.find(v => v.id === vehicle.id)) {
          set({ wins: [...wins, vehicle] });
        }
      },
      removeFromWins: (vehicleId: string) => {
        const { wins } = get();
        set({ wins: wins.filter(v => v.id !== vehicleId) });
      },
      
      // Bids management
      addToBids: (vehicle: Vehicle) => {
        const { bids } = get();
        if (!bids.find(v => v.id === vehicle.id)) {
          set({ bids: [...bids, vehicle] });
        }
      },
      removeFromBids: (vehicleId: string) => {
        const { bids } = get();
        set({ bids: bids.filter(v => v.id !== vehicleId) });
      },
      
      // Wishlist management
      addToWishlist: (vehicle: Vehicle) => {
        const { wishlist } = get();
        if (!wishlist.find(v => v.id === vehicle.id)) {
          set({ wishlist: [...wishlist, vehicle] });
        }
      },
      removeFromWishlist: (vehicleId: string) => {
        const { wishlist } = get();
        set({ wishlist: wishlist.filter(v => v.id !== vehicleId) });
      },
      
      // Authentication
      logout: async () => {
        const { token } = get();
        try {
          // Call logout API with token if available
          if (token) {
            await authService.logout(token);
          }
        } catch (error) {
          console.error('Logout API call failed:', error);
          // Continue with local logout even if API call fails
        }
        
        set({ 
          ...initialState,
          // Keep some data if needed, or clear everything
        });
      },
      
      register: (userData) => {
        set({
          category: userData.category,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar || '',
          isAuthenticated: true,
        });
      },

      refreshAuthToken: (newToken: string) => {
        set({ token: newToken });
      },
      
      // Utility functions
      clearAllData: () => set(initialState),
      
      isVehicleInList: (vehicleId: string, listType: 'watchList' | 'wins' | 'bids' | 'wishlist') => {
        const state = get();
        return state[listType].some(vehicle => vehicle.id === vehicleId);
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist certain fields, exclude sensitive data like password
      partialize: (state) => ({
        category: state.category,
        username: state.username,
        email: state.email,
        avatar: state.avatar,
        token: state.token,
        refreshToken: state.refreshToken,
        buyerId: state.buyerId,
        watchList: state.watchList,
        wins: state.wins,
        bids: state.bids,
        wishlist: state.wishlist,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
