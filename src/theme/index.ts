export type AppTheme = {
  colors: {
    background: string;
    card: string;
    text: string;
    mutedText: string;
    primary: string;
    border: string;
    tabIcon: string;
    tabIconActive: string;
    shadow: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  radii: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  fonts: {
    regular: string;
    medium: string;
    bold: string;
  };
};

export const theme: AppTheme = {
  colors: {
    background: '#0B0B0C',
    card: '#121214',
    text: '#FFFFFF',
    mutedText: '#9BA1A6',
    primary: '#FFFFFF',
    border: 'rgba(255,255,255,0.1)',
    tabIcon: '#9BA1A6',
    tabIconActive: '#FFFFFF',
    shadow: 'rgba(0,0,0,0.5)'
  },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  radii: { sm: 6, md: 10, lg: 16, pill: 999 },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System'
  }
};

export type Theme = typeof theme;


