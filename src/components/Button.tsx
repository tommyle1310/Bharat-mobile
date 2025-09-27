import React from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconIonicons from 'react-native-vector-icons/Ionicons';
import { theme } from '../theme';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline';
  disabled?: boolean;
  iconType?: 'ionicons' | 'fontAwesome';
  style?: any;
  icon?: string;
  iconPosition?: 'left' | 'right';
  iconColor?: string;
  loading?: boolean;
  loadingComponent?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  iconType = 'fontAwesome',
  disabled, 
  style,
  icon,
  iconPosition = 'left',
  iconColor,
  loading = false,
  loadingComponent
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        disabled ? styles.disabled : undefined,
        pressed && Platform.OS !== 'android' ? styles.pressed : undefined,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          loadingComponent || <Text style={[styles.label, labelStyles[variant]]}>Loading...</Text>
        ) : (
          <>
            {icon && iconPosition === 'left' && (
             iconType === 'fontAwesome' ? (
              <Icon 
                name={icon} 
                size={theme.fontSizes.md} 
                color={iconColor || labelStyles[variant].color}
                style={styles.leftIcon}
              />
             ) : (
              <IconIonicons name={icon} size={theme.fontSizes.md} color={iconColor || labelStyles[variant].color} style={styles.leftIcon} />
             )
            )}
            <Text style={[styles.label, labelStyles[variant], disabled ? styles.labelDisabled : undefined]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Icon 
                name={icon} 
                size={theme.fontSizes.md} 
                color={iconColor || labelStyles[variant].color}
                style={styles.rightIcon}
              />
            )}
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },
  pressed: { 
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  disabled: { 
    opacity: 0.6,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  label: { 
    fontWeight: '600', 
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.semibold,
  },
  labelDisabled: { 
    color: theme.colors.textMuted,
  },
});

const variantStyles = StyleSheet.create({
  primary: { 
    backgroundColor: theme.colors.primary, 
    borderColor: theme.colors.primary,
  },
  secondary: { 
    backgroundColor: theme.colors.buttonSecondary, 
    borderColor: theme.colors.buttonSecondary,
  },
  destructive: { 
    backgroundColor: theme.colors.buttonDestructive, 
    borderColor: theme.colors.buttonDestructive,
  },
  outline: { 
    backgroundColor: '#fff', 
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
});

const labelStyles = StyleSheet.create({
  primary: { color: theme.colors.textInverse },
  secondary: { color: theme.colors.textInverse },
  destructive: { color: theme.colors.textInverse },
  outline: { color: theme.colors.text },
});

export default Button;


