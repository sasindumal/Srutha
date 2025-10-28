import React, { useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
} from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { useChannel } from '../context/ChannelContext';
import { VideoCard } from '../components/VideoCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const HomeScreen = ({ navigation }: any) => {
  const { channels, videos, isLoading, refreshAllChannels, loadVideos } = useChannel();
  const theme = useTheme();

  useEffect(() => {
    loadVideos();
  }, []);

  const handleRefresh = async () => {
    await refreshAllChannels();
  };

  const renderEmptyState = () => {
    if (channels.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="video-outline" size={80} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No channels added yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your favorite YouTube channels
          </Text>
        </View>
      );
    }

    if (videos.length === 0 && !isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="video-outline" size={80} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No videos available</Text>
          <Text style={styles.emptySubtitle}>Pull down to refresh</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            onPress={() => navigation.navigate('VideoPlayer', { video: item })}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={videos.length === 0 ? styles.emptyList : undefined}
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddChannel')}
        color="#ffffff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    color: '#4b5563',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
