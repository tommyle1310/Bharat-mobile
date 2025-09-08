import React, { useEffect } from 'react';
import { useUserStore } from '../stores/userStore';

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const { isAuthenticated } = useUserStore();

  // Initialize store on app start
  useEffect(() => {
    // Any initialization logic can go here
    console.log('Store initialized, user authenticated:', isAuthenticated);
  }, [isAuthenticated]);

  return <>{children}</>;
};

export default StoreProvider;
