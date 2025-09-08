import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle } from '../types/Vehicle';

export interface UserState {
  // User profile information
  businessVertical: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  
  // User lists
  watchList: Vehicle[];
  wins: Vehicle[];
  bids: Vehicle[];
  wishlist: Vehicle[];
  
  // Authentication state
  isAuthenticated: boolean;
  
  // Actions
  setBusinessVertical: (vertical: string) => void;
  setUsername: (username: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setAvatar: (avatar: string) => void;
  
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
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (userData: {
    businessVertical: string;
    username: string;
    email: string;
    password: string;
    avatar?: string;
  }) => void;
  
  // Utility actions
  clearAllData: () => void;
  isVehicleInList: (vehicleId: string, listType: 'watchList' | 'wins' | 'bids' | 'wishlist') => boolean;
}

const initialState = {
  businessVertical: '',
  username: '',
  email: '',
  password: '',
  avatar: '',
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
      setBusinessVertical: (vertical: string) => set({ businessVertical: vertical }),
      setUsername: (username: string) => set({ username }),
      setEmail: (email: string) => set({ email }),
      setPassword: (password: string) => set({ password }),
      setAvatar: (avatar: string) => set({ avatar }),
      
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
      login: (email: string, password: string) => {
        // In a real app, you would validate credentials here
        set({ email, password, isAuthenticated: true });
      },
      
      logout: () => {
        set({ 
          ...initialState,
          // Keep some data if needed, or clear everything
        });
      },
      
      register: (userData) => {
        set({
          businessVertical: userData.businessVertical,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          avatar: userData.avatar || '',
          isAuthenticated: true,
        });
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
        businessVertical: state.businessVertical,
        username: state.username,
        email: state.email,
        avatar: state.avatar,
        watchList: state.watchList,
        wins: state.wins,
        bids: state.bids,
        wishlist: state.wishlist,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
