import { useUserStore } from '../stores/userStore';
import { Vehicle } from '../types/Vehicle';

export const useUser = () => {
  const store = useUserStore();
  
  return {
    // User profile
    businessVertical: store.businessVertical,
    username: store.username,
    email: store.email,
    avatar: store.avatar,
    isAuthenticated: store.isAuthenticated,
    
    // User lists
    watchList: store.watchList,
    wins: store.wins,
    bids: store.bids,
    wishlist: store.wishlist,
    
    // Profile actions
    setBusinessVertical: store.setBusinessVertical,
    setUsername: store.setUsername,
    setEmail: store.setEmail,
    setAvatar: store.setAvatar,
    
    // List management
    addToWatchList: store.addToWatchList,
    removeFromWatchList: store.removeFromWatchList,
    addToWins: store.addToWins,
    removeFromWins: store.removeFromWins,
    addToBids: store.addToBids,
    removeFromBids: store.removeFromBids,
    addToWishlist: store.addToWishlist,
    removeFromWishlist: store.removeFromWishlist,
    
    // Authentication
    login: store.login,
    logout: store.logout,
    register: store.register,
    
    // Utilities
    clearAllData: store.clearAllData,
    isVehicleInList: store.isVehicleInList,
  };
};
