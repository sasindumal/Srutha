import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { useChannel } from '../context/ChannelContext';
import { Video } from '../models/Video';
import { VideoCard } from '../components/VideoCard';

export const WatchHistoryScreen = ({ navigation }: any) => {
  const theme = useTheme();
  const { getWatchedVideos, markVideoAsUnwatched } = useChannel();
  const [watched, setWatched] = useState<Video[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const vids = await getWatchedVideos();
    // Sort latest watched first by watchedDate if present, else uploadDate
    vids.sort((a, b) => {
      const ad = a.watchedDate ? new Date(a.watchedDate).getTime() : new Date(a.uploadDate || 0).getTime();
      const bd = b.watchedDate ? new Date(b.watchedDate).getTime() : new Date(b.uploadDate || 0).getTime();
      return bd - ad;
    });
    setWatched(vids);
  }, [getWatchedVideos]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleToggleWatched = async (video: Video) => {
    // Unmark will remove from history list
    await markVideoAsUnwatched(video.id);
    await load();
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="history" size={80} color="#717171" />
      <Text style={styles.emptyTitle}>No watch history</Text>
      <Text style={styles.emptySubtitle}>Videos you mark as watched will appear here</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={watched}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            onPress={() => navigation.navigate('VideoPlayer', { video: item })}
            onToggleWatched={() => handleToggleWatched(item)}
            showWatchedButton
          />
        )}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={watched.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
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
