import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import { images } from '../images';
import { theme } from '../theme';

export type FullScreenLoaderProps = {
  visible: boolean;
  imageUrl?: string;
  backgroundColor?: string;
  imageSize?: number;
};

const { width, height } = Dimensions.get('window');

const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  visible,
  imageUrl,
  backgroundColor = 'rgba(0, 0, 0, 0.7)',
  imageSize = 200
}) => {
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [visible, pulseValue]);

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.imageContainer,
          {
            transform: [{ scale: pulseValue }],
          },
        ]}
      >
        <Image
          source={ images.logo}
          style={[styles.image, { width: imageSize, height: imageSize }]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 999,
    backgroundColor: theme.colors.backgroundSecondary,
  },
});

export default FullScreenLoader;
