import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../theme';

export type IconButtonProps = {
  icon: string;
  onPress?: () => void;
  style?: any;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
};

const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  onPress, 
  style,
  size = 'md',
  color
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        styles[size],
        style
      ]}
    >
      <Icon 
        name={icon} 
        size={styles[`${size}Text`].fontSize} 
        color={color || theme.colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  sm: {
    width: 36,
    height: 36,
  },
  md: {
    width: 44,
    height: 44,
  },
  lg: {
    width: 52,
    height: 52,
  },
  smText: {
    fontSize: theme.fontSizes.sm,
  },
  mdText: {
    fontSize: theme.fontSizes.md,
  },
  lgText: {
    fontSize: theme.fontSizes.lg,
  },
});

export default IconButton;
