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
          disabled={saving || loading}
        />
      ),
    });
    loadItems();
  }, [saving, loading]);

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

  const fetchAllPlaylistItems = async (): Promise<Video[]> => {
    const collected: Video[] = [] as any;
    youtubeService.resetPlaylistItemsPagination(playlist.id);
    // First page (if not already loaded into state)
    if (videos.length === 0) {
      const first = await youtubeService.getPlaylistItems(playlist.id, 50);
      collected.push(...(first as any));
    } else {
      collected.push(...videos);
    }
    // Next pages
    while (true) {
      const next = await youtubeService.getPlaylistItemsNext(playlist.id, 50);
      if (!next || next.length === 0) break;
      collected.push(...(next as any));
    }
    // Persist everything to DB
    if (collected.length > 0) {
      await databaseHelper.insertVideos(collected as any);
    }
    return collected as any;
  };

  const handleSavePlaylist = async () => {
    try {
      setSaving(true);
      // Ensure we have all items (not just first page)
      const allItems = await fetchAllPlaylistItems();
      if (!allItems || allItems.length === 0) {
        Alert.alert('Nothing to Save', 'This playlist has no videos to save.');
        return;
      }

      const newId = await createPlaylist({ name: playlist.title, description: playlist.description });
      // Add all items to local playlist
      for (let i = 0; i < allItems.length; i++) {
        await addVideoToPlaylist(newId, allItems[i].id);
      }
      Alert.alert('Saved', `Playlist saved with ${allItems.length} videos.`);
      // Navigate to the newly saved playlist so user can see the videos immediately
      navigation.navigate('PlaylistVideos', {
        playlist: { id: newId, name: playlist.title, description: playlist.description },
      });
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
