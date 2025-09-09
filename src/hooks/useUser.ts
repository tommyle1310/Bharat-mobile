import { useUserStore } from '../stores/userStore';
import { Vehicle } from '../types/Vehicle';

export const useUser = () => {
  const store = useUserStore();
  
  return {
    // User profile
    category: store.category,
    username: store.username,
    email: store.email,
    avatar: store.avatar,
    token: store.token,
    refreshToken: store.refreshToken,
    buyerId: store.buyerId,
    isAuthenticated: store.isAuthenticated,
    
    // User lists
    watchList: store.watchList,
    wins: store.wins,
    bids: store.bids,
    wishlist: store.wishlist,
    
    // Profile actions
    setCategory: store.setCategory,
    setUsername: store.setUsername,
    setEmail: store.setEmail,
    setAvatar: store.setAvatar,
    setAuthTokens: store.setAuthTokens,
    setBuyerId: store.setBuyerId,
    
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
    logout: store.logout,
    register: store.register,
    refreshAuthToken: store.refreshAuthToken,
    
    // Utilities
    clearAllData: store.clearAllData,
    isVehicleInList: store.isVehicleInList,
  };
};
