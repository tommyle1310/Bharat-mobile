import React from 'react';
import { Modal as RNModal, View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme';

export type ModalProps = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ visible, title, onClose, children }) => {
  return (
    <RNModal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            {title ? <Text style={styles.title}>{title}</Text> : <View />}
            <Pressable hitSlop={8} onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={theme.colors.text} />
            </Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: { 
    flex: 1, 
    backgroundColor: theme.colors.overlay, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: theme.spacing.lg 
  },
  card: {
    width: '100%',
    borderRadius: theme.radii.xl,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    ...theme.shadows.xl,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: theme.spacing.md 
  },
  title: { 
    fontSize: theme.fontSizes.lg, 
    fontWeight: '700', 
    color: theme.colors.text,
    fontFamily: theme.fonts.bold,
  },
  closeBtn: { 
    width: 36, 
    height: 36, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: theme.radii.md, 
    backgroundColor: theme.colors.backgroundSecondary 
  }
});

export default Modal;


