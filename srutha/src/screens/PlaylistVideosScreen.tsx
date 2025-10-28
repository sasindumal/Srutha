import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, Alert } from 'react-native';
import { IconButton } from 'react-native-paper';
import { usePlaylist } from '../context/PlaylistContext';
import { VideoCard } from '../components/VideoCard';
import { Video } from '../models/Video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const PlaylistVideosScreen = ({ route, navigation }: any) => {
  const { playlist } = route.params;
  const { getPlaylistVideos, removeVideoFromPlaylist } = usePlaylist();
  const [videos, setVideos] = useState<Video[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    const loadedVideos = await getPlaylistVideos(playlist.id);
    setVideos(loadedVideos);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  };

  const handleRemoveVideo = (videoId: string, videoTitle: string) => {
    Alert.alert(
      'Remove Video',
      `Remove "${videoTitle}" from this playlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeVideoFromPlaylist(playlist.id, videoId);
            await loadVideos();
          },
        },
      ]
    );
  };

  const renderVideoCard = ({ item }: { item: Video }) => (
    <View style={styles.videoCardContainer}>
      <VideoCard
        video={item}
        onPress={() => navigation.navigate('VideoPlayer', { video: item })}
      />
      <IconButton
        icon="close-circle"
        size={24}
        iconColor="#ef4444"
        style={styles.removeButton}
        onPress={() => handleRemoveVideo(item.id, item.title)}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="playlist-remove" size={80} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No videos in this playlist</Text>
      <Text style={styles.emptySubtitle}>
        Add videos from the home screen or channel videos
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderVideoCard}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={videos.length === 0 ? styles.emptyList : undefined}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  videoCardContainer: {
    position: 'relative',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(33, 33, 33, 0.95)',
    margin: 0,
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
  emptySubtitle: {
    fontSize: 14,
    color: '#717171',
    marginTop: 8,
    textAlign: 'center',
  },
});
