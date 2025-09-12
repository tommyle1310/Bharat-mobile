import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Text,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { vehicleServices } from '../services/vehicleServices';
import { resolveBaseUrl } from '../config';
import { Button, Header } from '../components';
import { theme } from '../theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

type Params = { id?: string };

export default function VehicleImagesScreen() {
  const route = useRoute<RouteProp<Record<string, Params>, 'VehicleImages'>>();
  const navigation = useNavigation();
  const { id: vehicleId } = route.params;

  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [modalIndex, setModalIndex] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));
  const [scale] = useState(new Animated.Value(1));
  const [pan] = useState(new Animated.ValueXY({ x: 0, y: 0 }));
  const [lastTap, setLastTap] = useState(0);

  // Refs for current gesture state
  const scaleRef = useRef(1);
  const lastScaleRef = useRef(1);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const initialPinchDistanceRef = useRef<number | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await vehicleServices.getVehicleImages(Number(vehicleId));
      console.log('cehck data images', data)
      setImages(data);
      setCurrentIndex(0);
    } catch (err) {
      console.log('Error fetching vehicle images', err);
    } finally {
      setLoading(false);
    }
  };

  const goToNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      animateSlide(newIndex);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      animateSlide(newIndex);
    }
  };

  const animateSlide = (index: number) => {
    Animated.timing(slideAnim, {
      toValue: -index * width,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getCurrentImageUri = () => {
    if (images.length === 0) return '';
    const currentImage = images[currentIndex];
    return `${resolveBaseUrl()}/data-files/vehicles/${vehicleId}/${currentImage.vehicle_image_id}.${currentImage.img_extension}`;
  };

  const getModalImageUri = (index: number) => {
    if (images.length === 0) return '';
    const image = images[index];
    return `${resolveBaseUrl()}/data-files/vehicles/${vehicleId}/${image.vehicle_image_id}.${image.img_extension}`;
  };

  const openModal = () => {
    setModalIndex(currentIndex);
    setSelectedImage(getCurrentImageUri());
    resetZoom();
  };

  const closeModal = () => {
    setSelectedImage(null);
    setCurrentIndex(modalIndex);
  };

  const goToNextModal = () => {
    if (modalIndex < images.length - 1) {
      const newIndex = modalIndex + 1;
      setModalIndex(newIndex);
      setSelectedImage(getModalImageUri(newIndex));
      // Reset zoom when changing images
      resetZoom();
    }
  };

  const goToPreviousModal = () => {
    if (modalIndex > 0) {
      const newIndex = modalIndex - 1;
      setModalIndex(newIndex);
      setSelectedImage(getModalImageUri(newIndex));
      // Reset zoom when changing images
      resetZoom();
    }
  };

  const resetZoom = () => {
    scaleRef.current = 1;
    lastScaleRef.current = 1;
    lastPanRef.current = { x: 0, y: 0 };
    initialPinchDistanceRef.current = null;

    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pan.x, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pan.y, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const zoomIn = () => {
    const target = 2;
    scaleRef.current = target;
    lastScaleRef.current = target;
    lastPanRef.current = { x: 0, y: 0 };
    Animated.parallel([
      Animated.timing(scale, {
        toValue: target,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pan.x, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pan.y, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      if (scaleRef.current > 1.01) resetZoom(); else zoomIn();
    } else {
      setLastTap(now);
    }
  };

  // Helper to clamp pan based on scale
  const clampPan = (x: number, y: number, s: number) => {
    const maxX = Math.max(0, (width * (s - 1)) / 2);
    const maxY = Math.max(0, (height * (s - 1)) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  // PanResponder for pinch and pan gestures (simple and robust)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt) => {
        const touches = evt.nativeEvent.touches;
        return touches.length === 2 || scaleRef.current > 1.01;
      },
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const t1 = touches[0];
          const t2 = touches[1];
          const d = Math.hypot(t2.pageX - t1.pageX, t2.pageY - t1.pageY);
          initialPinchDistanceRef.current = d;
          lastScaleRef.current = scaleRef.current;
        }
      },
      onPanResponderMove: (evt, gesture) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          const t1 = touches[0];
          const t2 = touches[1];
          const d = Math.hypot(t2.pageX - t1.pageX, t2.pageY - t1.pageY);
          if (!initialPinchDistanceRef.current) {
            initialPinchDistanceRef.current = d;
          }
          const scaleFactor = d / (initialPinchDistanceRef.current || d);
          const newScale = Math.max(1, Math.min(3, lastScaleRef.current * scaleFactor));
          scaleRef.current = newScale;
          scale.setValue(newScale);
          // Clamp pan when scale changes (especially when zooming out)
          const currentX = (pan.x as any)._value ?? 0;
          const currentY = (pan.y as any)._value ?? 0;
          const clamped = clampPan(currentX, currentY, newScale);
          pan.x.setValue(clamped.x);
          pan.y.setValue(clamped.y);
        } else if (touches.length === 1 && scaleRef.current > 1.01) {
          const newX = lastPanRef.current.x + gesture.dx;
          const newY = lastPanRef.current.y + gesture.dy;
          const clamped = clampPan(newX, newY, scaleRef.current);
          pan.x.setValue(clamped.x);
          pan.y.setValue(clamped.y);
        }
      },
      onPanResponderRelease: () => {
        // Persist pan
        const currentX = (pan.x as any)._value ?? 0;
        const currentY = (pan.y as any)._value ?? 0;
        const clamped = clampPan(currentX, currentY, scaleRef.current);
        lastPanRef.current = { x: clamped.x, y: clamped.y };
        pan.x.setValue(clamped.x);
        pan.y.setValue(clamped.y);

        // Reset when back to 1
        if (scaleRef.current <= 1.01) {
          resetZoom();
        }
        initialPinchDistanceRef.current = null;
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderTerminate: () => {
        initialPinchDistanceRef.current = null;
      },
    })
  ).current;

  useEffect(() => {
    console.log('cehck veh id', vehicleId);
    fetchImages();
  }, [vehicleId]);


  return (
    <View style={styles.container}>
      <Header
        type="master"
        canGoBack
        shouldRenderRightIcon={false}
        title={`Vehicle Images ${images.length > 0 ? `(${currentIndex + 1}/${images.length})` : ''}`}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading images...</Text>
        </View>
      ) : images.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="image-not-supported" size={64} color={theme.colors.textMuted} />
          <Text style={styles.emptyText}>No images available</Text>
        </View>
      ) : (
        <View style={styles.carouselContainer}>
          {/* Main Image Display */}
          <Pressable 
            style={styles.imageContainer}
            onPress={openModal}
          >
            <Image 
              source={{ uri: getCurrentImageUri() }} 
              style={styles.mainImage} 
              resizeMode="contain"
            />
          </Pressable>

          {/* Navigation Controls */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === 0 && styles.navButtonDisabled
              ]}
              onPress={goToPrevious}
              disabled={currentIndex === 0}
            >
              <MaterialIcons 
                name="chevron-left" 
                size={32} 
                color={currentIndex === 0 ? theme.colors.textMuted : theme.colors.text} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navButton,
                currentIndex === images.length - 1 && styles.navButtonDisabled
              ]}
              onPress={goToNext}
              disabled={currentIndex === images.length - 1}
            >
              <MaterialIcons 
                name="chevron-right" 
                size={32} 
                color={currentIndex === images.length - 1 ? theme.colors.textMuted : theme.colors.text} 
              />
            </TouchableOpacity>
          </View>

          {/* Image Indicators */}
          {images.length > 1 && (
            <View style={styles.indicatorsContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentIndex && styles.indicatorActive
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Fullscreen Modal */}
      <Modal visible={!!selectedImage} transparent>
        <View style={styles.modalContainer}>
          {selectedImage && (
            <View style={styles.zoomContainer} {...panResponder.panHandlers}>
              <Animated.View
                style={[
                  styles.zoomImageContainer,
                  {
                    transform: [
                      { translateX: pan.x },
                      { translateY: pan.y },
                      { scale: scale },
                    ],
                  },
                ]}
              >
                <Pressable 
                  onPress={handleDoubleTap}
                  style={styles.zoomPressable}
                >
                  <Image
                    source={{ uri: selectedImage }}
                    style={styles.zoomImage}
                    resizeMode="contain"
                  />
                </Pressable>
              </Animated.View>
            </View>
          )}

          {/* Modal Navigation Controls */}
          {images.length > 1 && (
            <View style={styles.modalNavigationContainer}>
              <TouchableOpacity
                style={[
                  styles.modalNavButton,
                  modalIndex === 0 && styles.modalNavButtonDisabled
                ]}
                onPress={goToPreviousModal}
                disabled={modalIndex === 0}
              >
                <MaterialIcons 
                  name="chevron-left" 
                  size={40} 
                  color={modalIndex === 0 ? 'rgba(255,255,255,0.3)' : 'white'} 
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalNavButton,
                  modalIndex === images.length - 1 && styles.modalNavButtonDisabled
                ]}
                onPress={goToNextModal}
                disabled={modalIndex === images.length - 1}
              >
                <MaterialIcons 
                  name="chevron-right" 
                  size={40} 
                  color={modalIndex === images.length - 1 ? 'rgba(255,255,255,0.3)' : 'white'} 
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Modal Header with Image Counter */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalCounter}>
              {modalIndex + 1} / {images.length}
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={closeModal}
          >
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    fontSize: theme.fontSizes.md,
    fontFamily: theme.fonts.regular,
  },
  carouselContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: theme.colors.card,
    margin: theme.spacing.md,
    // borderRadius: theme.radii.lg,
    // ...theme.shadows.md,
  },
  mainImage: {
    width: width - (theme.spacing.md * 2),
    height: height * 0.6,
    borderRadius: theme.radii.lg,
  },
  navigationContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    transform: [{ translateY: -20 }],
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  navButtonDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
    opacity: 0.5,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  indicatorActive: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  zoomContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomPressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomImageContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomImage: {
    width: width,
    height: height,
  },
  modalNavigationContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    transform: [{ translateY: -30 }],
  },
  modalNavButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modalNavButtonDisabled: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  modalCounter: {
    color: 'white',
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    fontFamily: theme.fonts.medium,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.pill,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 50,
    right: theme.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
