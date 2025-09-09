import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ToastState>({ visible: false, message: '', type: 'info' });
  const translateY = useRef(new Animated.Value(-80)).current;
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hide = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -80,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => setState(prev => ({ ...prev, visible: false })));
  }, [translateY]);

  const show = useCallback((message: string, type: ToastType = 'info', durationMs = 3000) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    setState({ visible: true, message, type });
    Animated.timing(translateY, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    hideTimerRef.current = setTimeout(hide, durationMs);
  }, [hide, translateY]);

  const value = useMemo(() => ({ show }), [show]);

  const backgroundColor = state.type === 'error'
    ? theme.colors.danger || '#D32F2F'
    : state.type === 'success'
    ? theme.colors.success || '#2E7D32'
    : theme.colors.card;

  const textColor = state.type === 'error' || state.type === 'success' ? theme.colors.textInverse : theme.colors.text;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {state.visible && (
        <Animated.View style={[styles.container, { transform: [{ translateY }] }]}> 
          <View style={[styles.toast, { backgroundColor }]}> 
            <Text style={[styles.message, { color: textColor }]} numberOfLines={3}>{state.message}</Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    paddingTop: 12,
  },
  toast: {
    minHeight: 44,
    maxWidth: '94%',
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  message: {
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.medium,
  },
});

export default ToastProvider;


