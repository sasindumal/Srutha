import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useChannel } from '../context/ChannelContext';
import { VideoCard } from '../components/VideoCard';
import { Video } from '../models/Video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ChannelVideosScreen = ({ route, navigation }: any) => {
  const { channel } = route.params;
  const { getChannelVideos } = useChannel();
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    loadChannelVideos();
  }, []);

  const loadChannelVideos = async () => {
    const channelVideos = await getChannelVideos(channel.id);
    setVideos(channelVideos);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="video-outline" size={80} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No videos from this channel</Text>
    </View>
  );

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
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={videos.length === 0 ? styles.emptyList : undefined}
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
});
