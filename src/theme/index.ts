export type AppTheme = {
  colors: {
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
    // Primary colors - Professional green palette
    primary: '#63c551',
    primaryLight: '#7dd66a',
    primaryDark: '#4fa83d',
    
    // Background colors - Clean, modern grays
    background: '#FAFAFA',
    backgroundSecondary: '#F8F9FA',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    
    // Text colors - High contrast, readable
    text: '#1F2937',
    textSecondary: '#374151',
    textMuted: '#6B7280',
    textInverse: '#FFFFFF',
    
    // Status colors - Clear, accessible
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
    
    // UI colors - Subtle, professional
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    divider: '#F3F4F6',
    overlay: 'rgba(0, 0, 0, 0.4)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Interactive colors
    tabIcon: '#9CA3AF',
    tabIconActive: '#63c551',
    buttonPrimary: '#63c551',
    buttonSecondary: '#F59E0B',
    buttonDestructive: '#EF4444',
    buttonOutline: '#E5E7EB',
    
    // Special colors
    accent: '#8B5CF6',
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
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  }
};

export type Theme = typeof theme;


