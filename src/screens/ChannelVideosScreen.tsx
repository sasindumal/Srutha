import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { useChannel } from '../context/ChannelContext';
import { VideoCard } from '../components/VideoCard';
import { Video } from '../models/Video';
import { ChannelPlaylist } from '@/models/ChannelPlaylist';
import { youtubeService } from '../services/YouTubeService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ChannelVideosScreen = ({ route, navigation }: any) => {
  const { channel } = route.params;
  const { getChannelVideos } = useChannel();
  const [videos, setVideos] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<ChannelPlaylist[]>([]);
  const [activeTab, setActiveTab] = useState<'videos' | 'playlists'>('videos');

  useEffect(() => {
    loadChannelVideos();
    // prefetch playlists as well
    loadChannelPlaylists();
  }, []);

  const loadChannelVideos = async () => {
    const channelVideos = await getChannelVideos(channel.id);
    setVideos(channelVideos);
  };

  const loadChannelPlaylists = async () => {
    try {
      youtubeService.resetChannelPlaylistsPagination(channel.id);
      const pls = await youtubeService.getChannelPlaylists(channel.id, 25);
      setPlaylists(pls);
    } catch (e) {
      // noop for now
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="video-outline" size={80} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No videos from this channel</Text>
    </View>
  );

  const renderTabHeader = () => (
    <View style={styles.tabHeader}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'videos' && styles.tabButtonActive]}
        onPress={() => setActiveTab('videos')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'videos' && styles.tabButtonTextActive]}>Videos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'playlists' && styles.tabButtonActive]}
        onPress={() => setActiveTab('playlists')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'playlists' && styles.tabButtonTextActive]}>Playlists</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPlaylistItem = ({ item }: { item: ChannelPlaylist }) => (
    <TouchableOpacity
      style={styles.playlistRow}
      onPress={() => navigation.navigate('ChannelPlaylist', { playlist: item })}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/320x180' }} style={styles.playlistThumb} />
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.playlistMeta} numberOfLines={1}>{item.itemCount ?? 0} videos • {channel.name}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderTabHeader()}
      {activeTab === 'videos' ? (
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
      ) : (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          renderItem={renderPlaylistItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="playlist-music-outline" size={80} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No playlists from this channel</Text>
            </View>
          }
          contentContainerStyle={playlists.length === 0 ? styles.emptyList : undefined}
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
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#0F0F0F',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#272727',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#212121',
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: '#3D3D3D',
  },
  tabButtonText: {
    color: '#AAAAAA',
    fontSize: 13,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
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
  playlistRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  playlistThumb: {
    width: 160,
    height: 90,
    borderRadius: 6,
    backgroundColor: '#272727',
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  playlistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F1F1F1',
  },
  playlistMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#AAAAAA',
  },
});
