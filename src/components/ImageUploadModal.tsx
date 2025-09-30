import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Dimensions,
  Animated,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { theme } from '../theme';
import Button from './Button';

const { height } = Dimensions.get('window');

export interface ImageUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (images: { front?: string; back?: string; pan?: string }) => void;
  type: 'aadhaar' | 'pan';
  initialImages?: { front?: string; back?: string; pan?: string };
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  visible,
  onClose,
  onConfirm,
  type,
  initialImages = {},
}) => {
  const [images, setImages] = useState<{ front?: string; back?: string; pan?: string }>(initialImages);
  const [slideAnim] = useState(new Animated.Value(height));

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  useEffect(() => {
    if (visible) {
      setImages(initialImages);
    }
  }, [visible, initialImages]);

  const openImagePicker = (imageType: 'front' | 'back' | 'pan') => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          setImages(prev => ({
            ...prev,
            [imageType]: asset.uri,
          }));
        }
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(images);
    onClose();
  };

  const handleRemoveImage = (imageType: 'front' | 'back' | 'pan') => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setImages(prev => ({
              ...prev,
              [imageType]: undefined,
            }));
          },
        },
      ]
    );
  };

  const ImageBox: React.FC<{
    title: string;
    imageUri?: string;
    onPress: () => void;
    onRemove: () => void;
  }> = ({ title, imageUri, onPress, onRemove }) => (
    <View style={styles.imageBox}>
      <Text style={styles.imageBoxTitle}>{title}</Text>
      <Pressable style={styles.imageContainer} onPress={onPress}>
        {imageUri ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            <Pressable style={styles.removeButton} onPress={onRemove}>
              <Icon name="close-circle" size={24} color={theme.colors.error} />
            </Pressable>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon name="camera" size={48} color={theme.colors.textMuted} />
            <Text style={styles.placeholderText}>Tap to select image</Text>
          </View>
        )}
      </Pressable>
    </View>
  );

  const isAadhaar = type === 'aadhaar';
  const hasRequiredImages = isAadhaar 
    ? images.front && images.back 
    : images.pan;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              Upload {isAadhaar ? 'Aadhaar' : 'PAN'} Document
            </Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isAadhaar ? (
              <>
                <ImageBox
                  title="Aadhaar Front"
                  imageUri={images.front}
                  onPress={() => openImagePicker('front')}
                  onRemove={() => handleRemoveImage('front')}
                />
                <ImageBox
                  title="Aadhaar Back"
                  imageUri={images.back}
                  onPress={() => openImagePicker('back')}
                  onRemove={() => handleRemoveImage('back')}
                />
              </>
            ) : (
              <ImageBox
                title="PAN Document"
                imageUri={images.pan}
                onPress={() => openImagePicker('pan')}
                onRemove={() => handleRemoveImage('pan')}
              />
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={styles.cancelButton}
            />
            <Button
              title="Confirm"
              variant="primary"
              onPress={handleConfirm}
              style={styles.confirmButton}
              disabled={!hasRequiredImages}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    height: height * 0.7,
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fonts.semibold,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  imageBox: {
    marginBottom: theme.spacing.xl,
  },
  imageBoxTitle: {
    fontSize: theme.fontSizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.semibold,
  },
  imageContainer: {
    height: 200,
    borderRadius: theme.radii.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: theme.colors.background,
  },
  imagePreview: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radii.md,
  },
  removeButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 2,
  },
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    fontFamily: theme.fonts.regular,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 2,
  },
});

export default ImageUploadModal;
