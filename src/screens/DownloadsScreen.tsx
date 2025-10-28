import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, Image, TouchableOpacity, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface LocalAsset {
  id: string;
  uri: string;
  filename?: string;
}

export const DownloadsScreen = ({ navigation }: any) => {
  const [assets, setAssets] = useState<LocalAsset[]>([]);
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!permission || !permission.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          setLoading(false);
          return;
        }
      }
      await loadDownloads();
    })();
  }, []);

  const loadDownloads = async () => {
    try {
      setLoading(true);
      const album = await MediaLibrary.getAlbumAsync('Srutha Downloads');
      if (!album) {
        setAssets([]);
        return;
      }
      const page = await MediaLibrary.getAssetsAsync({
        album,
        mediaType: 'video',
        first: 200,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });
      setAssets(page.assets.map(a => ({ id: a.id, uri: a.uri, filename: a.filename })));
    } catch (e) {
      Alert.alert('Error', 'Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="download" size={80} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No downloads</Text>
      <Text style={styles.emptySubtitle}>Use the Download option on a video to save it here</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={assets}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.thumbWrap} onPress={() => {}}>
            <Image source={{ uri: item.uri }} style={styles.thumb} />
            <View style={styles.thumbOverlay}>
              <Icon name="play-circle-outline" size={28} color="#ffffff" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? renderEmpty : null}
        contentContainerStyle={assets.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  emptyList: { flexGrow: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, color: '#AAAAAA', marginTop: 16, fontWeight: '500' },
  emptySubtitle: { fontSize: 14, color: '#717171', marginTop: 8, textAlign: 'center' },
  thumbWrap: { flex: 1, aspectRatio: 16/9, margin: 6, backgroundColor: '#272727', borderRadius: 6, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  thumbOverlay: { position: 'absolute', right: 8, bottom: 8, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 4 },
});
