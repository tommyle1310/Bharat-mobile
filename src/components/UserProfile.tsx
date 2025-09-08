import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useUser } from '../hooks/useUser';
import { theme } from '../theme';

export const UserProfile: React.FC = () => {
  const {
    username,
    email,
    businessVertical,
    avatar,
    watchList,
    wins,
    bids,
    wishlist,
    logout,
    setBusinessVertical,
  } = useUser();

  const handleLogout = () => {
    logout();
  };

  const toggleBusinessVertical = () => {
    const newVertical = businessVertical === 'INSURANCE' ? 'BANKING' : 'INSURANCE';
    setBusinessVertical(newVertical);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Username:</Text>
        <Text style={styles.value}>{username || 'Not set'}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{email || 'Not set'}</Text>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Business Vertical:</Text>
        <Text style={styles.value}>{businessVertical || 'Not set'}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Lists:</Text>
        <Text style={styles.stat}>Watchlist: {watchList.length} items</Text>
        <Text style={styles.stat}>Wins: {wins.length} items</Text>
        <Text style={styles.stat}>Bids: {bids.length} items</Text>
        <Text style={styles.stat}>Wishlist: {wishlist.length} items</Text>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={toggleBusinessVertical}>
        <Text style={styles.buttonText}>Toggle Business Vertical</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: theme.colors.text,
    opacity: 0.8,
  },
  statsContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 10,
  },
  stat: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 5,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
