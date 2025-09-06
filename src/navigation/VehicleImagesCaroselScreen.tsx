import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { vehicleServices } from '../services/vehicleServices';
import { resolveBaseUrl } from '../config';
import { Dimensions } from 'react-native';
import { Button, Header } from '../components';
import ImageZoom from 'react-native-image-pan-zoom';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

type Params = { id?: string };

export default function VehicleImagesScreen() {
  const route = useRoute<RouteProp<Record<string, Params>, 'VehicleImages'>>();
  const navigation = useNavigation();
  const { id: vehicleId } = route.params;

  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await vehicleServices.getVehicleImages(Number(vehicleId));
      setImages(data);
    } catch (err) {
      console.log('Error fetching vehicle images', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('cehck veh id', vehicleId);
    fetchImages();
  }, [vehicleId]);

  const renderItem = ({ item }: { item: any }) => {
    const uri = `${resolveBaseUrl()}/data-files/vehicles/${vehicleId}/${
      item.vehicle_image_id
    }.${item.img_extension}`;
    return (
      <Pressable onPress={() => setSelectedImage(uri)}>
        <View style={styles.card}>
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Header
      type="master"
      canGoBack
      shouldRenderRightIcon={false}
      title="Vehicle Images" />
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={images}
          keyExtractor={item => String(item.vehicle_image_id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}

      {/* Fullscreen Modal */}
      <Modal visible={!!selectedImage} transparent>
        <View style={styles.modalContainer}>
          {selectedImage && (
            <ImageZoom
            style={{backgroundColor: theme.colors.border}}
              enableDoubleClickZoom={true}
              cropWidth={width}
              cropHeight={height}
              imageWidth={width}
              imageHeight={height}
            >
              <Image
                source={{ uri: selectedImage }}
                style={{ width, height }}
                resizeMode="contain"
              />
            </ImageZoom>
          )}

          <Button
            title=""
            onPress={() => setSelectedImage(null)}
            icon="close"
            iconColor="white"
            iconPosition="right"
            style={{
              position: 'absolute',
              top: 10,
              right: 6,
              borderRadius: 8,
              padding: 8,
              backgroundColor: 'black/60',
            }}
          ></Button>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
        elevation: 3,
    backgroundColor: '#f9f9f9',
  },
  image: { width: '100%', height: 200 },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
});
