import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, PanResponder, PanResponderGestureState, GestureResponderEvent } from 'react-native';
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
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingMsRef = useRef<number>(0);
  const shownAtRef = useRef<number | null>(null);

  const hide = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    shownAtRef.current = null;
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start(() => setState(prev => ({ ...prev, visible: false })));
  }, [translateY, opacity]);

  const show = useCallback((message: string, type: ToastType = 'info', durationMs = 5000) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    remainingMsRef.current = durationMs;
    shownAtRef.current = Date.now();
    setState({ visible: true, message, type });
    translateY.stopAnimation();
    opacity.stopAnimation();
    translateY.setValue(-80);
    opacity.setValue(0);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();

    hideTimerRef.current = setTimeout(hide, remainingMsRef.current);
  }, [hide, translateY, opacity]);

  const pauseTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (shownAtRef.current != null) {
      const elapsed = Date.now() - shownAtRef.current;
      remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
      shownAtRef.current = null;
    }
  }, []);

  const resumeTimer = useCallback(() => {
    if (state.visible && remainingMsRef.current > 0) {
      shownAtRef.current = Date.now();
      hideTimerRef.current = setTimeout(hide, remainingMsRef.current);
    }
  }, [hide, state.visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_: GestureResponderEvent, gesture: PanResponderGestureState) => Math.abs(gesture.dy) > 2,
      onPanResponderGrant: () => {
        pauseTimer();
      },
      onPanResponderMove: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
        if (gesture.dy < 0) {
          const clamped = Math.max(-120, gesture.dy);
          translateY.setValue(clamped);
          const progress = Math.min(1, Math.abs(clamped) / 120);
          opacity.setValue(1 - 0.5 * progress);
        }
      },
      onPanResponderRelease: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
        const shouldDismiss = gesture.dy < -40 || gesture.vy < -0.8;
        if (shouldDismiss) {
          hide();
        } else {
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 180,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 160,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            })
          ]).start(() => {
            resumeTimer();
          });
        }
      },
      onPanResponderTerminate: () => {
        // Gesture cancelled, reset and resume
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: 160,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 140,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          })
        ]).start(() => {
          resumeTimer();
        });
      },
    })
  ).current;

  const value = useMemo(() => ({ show }), [show]);

  const backgroundColor = state.type === 'error'
    ? theme.colors.error || '#D32F2F'
    : state.type === 'success'
    ? theme.colors.success || '#2E7D32'
    : theme.colors.card;

  const textColor = state.type === 'error' || state.type === 'success' ? theme.colors.textInverse : theme.colors.text;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {state.visible && (
        <Animated.View style={[styles.container, { transform: [{ translateY }], opacity }]}> 
          <View style={[styles.toast, { backgroundColor }]} {...panResponder.panHandlers}> 
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
    pointerEvents: 'box-none', // Allow touches to pass through to underlying components
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


