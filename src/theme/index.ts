export type AppTheme = {
  colors: {
    white: string;
    dark: string;
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    
    // Background colors
    background: string;
    backgroundSecondary: string;
    card: string;
    cardElevated: string;
    
    // Text colors
    text: string;
    textSecondary: string;
    textMuted: string;
    textInverse: string;
    
    // Status colors
    success: string;
    successLight: string;
    warning: string;
    warningLight: string;
    error: string;
    errorLight: string;
    info: string;
    infoLight: string;
    
    // UI colors
    border: string;
    borderLight: string;
    divider: string;
    overlay: string;
    shadow: string;
    
    // Interactive colors
    tabIcon: string;
    tabIconActive: string;
    buttonPrimary: string;
    buttonSecondary: string;
    buttonDestructive: string;
    buttonOutline: string;
    
    // Special colors
    accent: string;
    highlight: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radii: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  fonts: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
    xl: object;
  };
};

export const theme: AppTheme = {
  colors: {
    white: '#FFFFFF',
    dark: '#333',
    // Primary colors - Modern emerald palette
    primary: '#67c151',
    primaryLight: '#e8fce3',
    primaryDark: '#047857',
    
    // Background colors - Clean, modern grays
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    
    // Text colors - High contrast, readable
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    textInverse: '#FFFFFF',
    
    // Status colors - Clear, accessible
    success: '#059669',
    successLight: '#D1FAE5',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    error: '#DC2626',
    errorLight: '#FEE2E2',
    info: '#2563EB',
    infoLight: '#DBEAFE',
    
    // UI colors - Subtle, professional
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    divider: '#F1F5F9',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Interactive colors
    tabIcon: '#64748B',
    tabIconActive: '#059669',
    buttonPrimary: '#059669',
    buttonSecondary: '#D97706',
    buttonDestructive: '#DC2626',
    buttonOutline: '#E2E8F0',
    
    // Special colors
    accent: '#7C3AED',
    highlight: '#FEF3C7',
  },
  spacing: { 
    xs: 4, 
    sm: 8, 
    md: 12, 
    lg: 16, 
    xl: 24, 
    xxl: 32 
  },
  radii: { 
    xs: 4, 
    sm: 6, 
    md: 8, 
    lg: 12, 
    xl: 16, 
    pill: 999 
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System'
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 15,
    },
  }
};

export type Theme = typeof theme;


