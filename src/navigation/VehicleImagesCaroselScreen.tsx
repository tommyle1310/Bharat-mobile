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
  const [translateX] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(0));
  const [isZoomed, setIsZoomed] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  
  // Refs for tracking current values
  const scaleValue = useRef(1);
  const translateXValue = useRef(0);
  const translateYValue = useRef(0);
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const currentScale = useRef(1);
  const isZoomedRef = useRef(false);
  const isPanningRef = useRef(false);

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
    resetZoom(); // Reset zoom when opening modal
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
    console.log('Resetting zoom');
    setIsZoomed(false);
    isZoomedRef.current = false;
    scaleValue.current = 1;
    currentScale.current = 1;
    translateXValue.current = 0;
    translateYValue.current = 0;
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
    
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const zoomIn = () => {
    console.log('Zooming in - isZoomed will be set to true');
    setIsZoomed(true);
    isZoomedRef.current = true;
    scaleValue.current = 2.5;
    currentScale.current = 2.5;
    lastScale.current = 2.5;
    
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 2.5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      console.log('Zoom in animation completed - isZoomed:', true);
      // Ensure isZoomed stays true after animation
      setIsZoomed(true);
      isZoomedRef.current = true;
    });
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      console.log('Double tap detected, isZoomed:', isZoomedRef.current);
      if (isZoomedRef.current) {
        console.log('Double tap - resetting zoom');
        resetZoom();
      } else {
        console.log('Double tap - zooming in');
        zoomIn();
      }
    } else {
      setLastTap(now);
    }
  };

  // PanResponder for pinch and pan gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        console.log('onStartShouldSetPanResponder - touches:', touches.length, 'isZoomed:', isZoomedRef.current);
        // Always respond to start gestures
        return true;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        console.log('onMoveShouldSetPanResponder - touches:', touches.length, 'isZoomed:', isZoomedRef.current);
        // Only respond if we have 2 touches (pinch) or if already zoomed (pan)
        return touches.length === 2 || isZoomedRef.current;
      },
      onPanResponderGrant: (evt, gestureState) => {
        console.log('onPanResponderGrant - touches:', evt.nativeEvent.touches.length);
        // Set offsets to current values
        scale.setOffset(scaleValue.current);
        translateX.setOffset(translateXValue.current);
        translateY.setOffset(translateYValue.current);
        
        // Reset values to 0 for new gesture
        scale.setValue(0);
        translateX.setValue(0);
        translateY.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        console.log('onPanResponderMove - touches:', touches.length, 'dx:', gestureState.dx, 'dy:', gestureState.dy, 'isZoomed:', isZoomed);
        
        if (touches.length === 2) {
          // Pinch gesture
          const touch1 = touches[0];
          const touch2 = touches[1];
          
          const distance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) + 
            Math.pow(touch2.pageY - touch1.pageY, 2)
          );
          
          if (lastScale.current === 0) {
            lastScale.current = scaleValue.current;
            currentScale.current = scaleValue.current;
          }
          
          const scaleFactor = distance / 200; // Adjust sensitivity
          const newScale = Math.max(0.5, Math.min(4, lastScale.current * scaleFactor));
          currentScale.current = newScale;
          
          scale.setValue(newScale - scaleValue.current);
          const newIsZoomed = newScale > 1.1;
          setIsZoomed(newIsZoomed);
          isZoomedRef.current = newIsZoomed;
        } else if (touches.length === 1 && isZoomedRef.current) {
          // Pan gesture - only when zoomed
          isPanningRef.current = true;
          console.log('Panning - currentScale:', currentScale.current, 'dx:', gestureState.dx, 'dy:', gestureState.dy);
          
          // Calculate the maximum translation based on current scale
          const scaleForPan = Math.max(currentScale.current, scaleValue.current);
          const maxTranslateX = (width * (scaleForPan - 1)) / 2;
          const maxTranslateY = (height * (scaleForPan - 1)) / 2;
          
          console.log('Pan boundaries - maxTranslateX:', maxTranslateX, 'maxTranslateY:', maxTranslateY);
          
          // Apply pan with boundary constraints
          const newTranslateX = Math.max(
            -maxTranslateX,
            Math.min(maxTranslateX, gestureState.dx)
          );
          const newTranslateY = Math.max(
            -maxTranslateY,
            Math.min(maxTranslateY, gestureState.dy)
          );
          
          console.log('Pan values - newTranslateX:', newTranslateX, 'newTranslateY:', newTranslateY);
          
          // Only update translation, never touch scale
          translateX.setValue(newTranslateX);
          translateY.setValue(newTranslateY);
        } else if (touches.length === 1 && !isZoomedRef.current) {
          // Single touch when not zoomed - do nothing but log
          console.log('Single touch when not zoomed - ignoring pan gesture');
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        console.log('onPanResponderRelease - touches:', evt.nativeEvent.touches.length);
        // Flatten offsets and update current values
        scale.flattenOffset();
        translateX.flattenOffset();
        translateY.flattenOffset();
        
        // Update current values based on the gesture
        if (evt.nativeEvent.touches.length === 2) {
          // Pinch gesture - update scale
          isPanningRef.current = false;
          scaleValue.current = currentScale.current;
          const newIsZoomed = scaleValue.current > 1.1;
          setIsZoomed(newIsZoomed);
          isZoomedRef.current = newIsZoomed;
          console.log('Pinch gesture completed - scaleValue:', scaleValue.current, 'isZoomed:', newIsZoomed);
        } else if (evt.nativeEvent.touches.length === 1 && isZoomedRef.current) {
          // Pan gesture - update translation
          translateXValue.current += gestureState.dx;
          translateYValue.current += gestureState.dy;
          console.log('Pan gesture completed - translateXValue:', translateXValue.current, 'translateYValue:', translateYValue.current);
        }
        
        // Reset last scale for next pinch
        lastScale.current = 0;
        
        // Only reset zoom if it's a pinch gesture that resulted in scale < 1
        // NEVER reset zoom for pan gestures
        if (evt.nativeEvent.touches.length === 2 && scaleValue.current < 1 && !isPanningRef.current) {
          console.log('Resetting zoom due to pinch zoom out below 1');
          resetZoom();
        }
        
        // Reset panning flag
        isPanningRef.current = false;
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
                      { scale: scale },
                      { translateX: translateX },
                      { translateY: translateY },
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
