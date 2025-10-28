import React, { useEffect, useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTheme, IconButton } from 'react-native-paper';
import { youtubeService } from '../services/YouTubeService';
import { Video } from '../models/Video';
import { VideoCard } from '../components/VideoCard';
import { usePlaylist } from '../context/PlaylistContext';
import { databaseHelper } from '../services/DatabaseHelper';

export const ChannelPlaylistScreen = ({ route, navigation }: any) => {
  const { playlist } = route.params; // { id, title, description, ... }
  const theme = useTheme();
  const { createPlaylist, addVideoToPlaylist } = usePlaylist();

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: playlist.title,
      headerRight: () => (
        <IconButton
          icon="playlist-plus"
          iconColor="#fff"
          onPress={handleSavePlaylist}
          disabled={saving}
        />
      ),
    });
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      youtubeService.resetPlaylistItemsPagination(playlist.id);
      const items = await youtubeService.getPlaylistItems(playlist.id, 50);
      // Persist videos into DB to ensure they are available for local playlist linking
      await databaseHelper.insertVideos(items as any);
      setVideos(items as any);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlaylist = async () => {
    try {
      setSaving(true);
      const newId = await createPlaylist({ name: playlist.title, description: playlist.description });
      // Ensure current batch of videos are saved (already inserted on load)
      for (let i = 0; i < videos.length; i++) {
        await addVideoToPlaylist(newId, videos[i].id);
      }
      Alert.alert('Saved', 'Playlist saved to your Playlists');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save playlist');
    } finally {
      setSaving(false);
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No videos in this playlist</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VideoCard
              video={item}
              onPress={() => navigation.navigate('VideoPlayer', { video: item })}
            />
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={videos.length === 0 ? styles.emptyList : undefined}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#AAAAAA',
    marginTop: 16,
    fontWeight: '500',
  },
});
