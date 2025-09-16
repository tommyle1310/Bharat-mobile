import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Image, ImageBackground, StyleSheet, Pressable, Text, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';

const slides = [
  require('../../assets/splash/1_logoscreen.jpg'),
  require('../../assets/splash/2_splash.jpg'),
  require('../../assets/splash/3_splash2.jpg'),
  require('../../assets/splash/4_splash3.jpg'),
];

export default function SplashScreen() {
  const navigation = useNavigation<any>();
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;

  const isFirst = index === 0;
  const isLast = index === slides.length - 1;

  const startFadeIn = () => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    startFadeIn();
  }, [index]);

  useEffect(() => {
    if (!isFirst) return;
    const id = setTimeout(() => {
      setIndex(1);
    }, 3000);
    return () => clearTimeout(id);
  }, [isFirst]);

  const onNext = () => setIndex(Math.min(index + 1, slides.length - 1));
  const onFinish = () => {
    // Always navigate to Auth when splash finishes
    navigation.replace('Auth');
  };

  const Button = useMemo(() => {
    if (isFirst) return null;
    if (isLast)
      return (
        <Pressable style={styles.finishBtn} onPress={onFinish}>
          <Text style={styles.btnText}>Finish</Text>
        </Pressable>
      );
    return (
      <Pressable style={styles.nextBtn} onPress={onNext}>
        <Text style={styles.btnText}>Next</Text>
        <MaterialIcons name="arrow-forward" size={20} color={theme.colors.textInverse} />
      </Pressable>
    );
  }, [isFirst, isLast, onNext]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.flex, { opacity: fade }]}> 
        {index === 0 ? (
          <Image source={slides[index]} style={styles.image} resizeMode="cover" />
        ) : (
          <ImageBackground source={slides[index]} style={styles.image} resizeMode="cover">
            <View style={index === 3 ? styles.overlayFinish : styles.overlay}>{Button}</View>
          </ImageBackground>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: theme.spacing.veryLarge,
    left: theme.spacing.xl,
    alignItems: 'flex-start',
  },
  overlayFinish: {
    position: 'absolute',
    top: theme.spacing.veryVeryLarge,
    left: theme.spacing.xl,
    alignItems: 'flex-start',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radii.md,
  },
  finishBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.radii.md,
  },
  btnText: {
    color: theme.colors.textInverse,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
  },
});


