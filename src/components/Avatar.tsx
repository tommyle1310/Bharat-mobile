import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../theme';
import Modal from './Modal';

export type AvatarProps = {
  url?: string;
  title?: string;
  isEditable?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onImageChange?: (imageUri: string) => void;
};

const Avatar: React.FC<AvatarProps> = ({
  url,
  title = 'Avatar',
  isEditable = false,
  size = 'md',
  onImageChange
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditPress = () => {
    setShowModal(true);
  };

  const handleImagePicker = async () => {
    try {
      setIsLoading(true);
      
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 1000,
        maxWidth: 1000,
        quality: 0.8,
      };

      const result = await launchImageLibrary(options);

      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', 'Failed to pick image');
        return;
      }

      if (result.assets && result.assets[0]?.uri) {
        const imageUri = result.assets[0].uri;
        onImageChange?.(imageUri);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeValue = () => {
    switch (size) {
      case 'sm': return 40;
      case 'md': return 60;
      case 'lg': return 80;
      case 'xl': return 120;
      default: return 60;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 8;
      case 'md': return 12;
      case 'lg': return 16;
      case 'xl': return 20;
      default: return 12;
    }
  };

  const sizeValue = getSizeValue();
  const iconSize = getIconSize();

  return (
    <>
      <View style={styles.container}>
        <View style={[styles.avatar, { width: sizeValue, height: sizeValue }]}>
          {url ? (
            <Image source={{ uri: url }} style={[styles.image, { width: sizeValue, height: sizeValue }]} />
          ) : (
            <View style={[styles.placeholder, { width: sizeValue, height: sizeValue }]}>
              <Icon name="person" size={sizeValue * 0.4} color={theme.colors.textMuted} />
            </View>
          )}
          
          {isEditable && (
            <Pressable style={[styles.editButton, { width: iconSize + 12, height: iconSize + 12 }]} onPress={handleEditPress}>
              <Icon name="pencil" size={iconSize} color={theme.colors.textInverse} />
            </Pressable>
          )}
        </View>
      </View>

      <Modal
        visible={showModal}
        title={`Edit ${title}`}
        onClose={() => setShowModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Choose a new image for your {title.toLowerCase()}
          </Text>
          
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            
            <Pressable
              style={[styles.modalButton, styles.selectButton]}
              onPress={handleImagePicker}
              disabled={isLoading}
            >
              <Text style={styles.selectButtonText}>
                {isLoading ? 'Loading...' : 'Select Image'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    borderRadius: 999,
    position: 'relative',
    backgroundColor: theme.colors.primaryLight,
  },
  image: {
    borderRadius: 999,
  },
  placeholder: {
    borderRadius: 999,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  editButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  modalContent: {
    paddingVertical: theme.spacing.md,
  },
  modalText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontFamily: theme.fonts.regular,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  cancelButton: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButtonText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text,
    fontFamily: theme.fonts.medium,
  },
  selectButtonText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.textInverse,
    fontFamily: theme.fonts.medium,
  },
});

export default Avatar;
