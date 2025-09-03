import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme';

export type SpinnerProps = {
  size?: number;
  color?: string;
  style?: any;
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 80,
  color = theme.colors.primary,
  style
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const scale = size / 80; // Base size is 80px

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Animated.View
        style={[
          styles.loader,
          {
            width: size,
            height: size,
            borderWidth: 10 * scale,
            transform: [
              {
                rotate: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        {/* Corner dots */}
        <View style={[styles.cornerDot, styles.topLeft, { width: 20 * scale, height: 20 * scale }]} />
        <View style={[styles.cornerDot, styles.topRight, { width: 20 * scale, height: 20 * scale }]} />
        <View style={[styles.cornerDot, styles.bottomRight, { width: 20 * scale, height: 20 * scale }]} />
        <View style={[styles.cornerDot, styles.bottomLeft, { width: 20 * scale, height: 20 * scale }]} />
        
        {/* Center square */}
        <View style={[styles.centerSquare, { width: 40 * scale, height: 40 * scale }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    borderColor: 'transparent',
    backgroundColor: theme.colors.background,
    borderRadius: 999,
    position: 'relative',
    overflow: 'hidden',
  },
  cornerDot: {
    position: 'absolute',
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
  },
  topLeft: {
    top: 0,
    left: 0,
  },
  topRight: {
    top: 0,
    right: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
  },
  centerSquare: {
    position: 'absolute',
    backgroundColor: theme.colors.primary,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
});

export default Spinner;
