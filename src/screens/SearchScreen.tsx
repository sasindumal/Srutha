import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from 'react-native';
import { Searchbar, Chip } from 'react-native-paper';
import { databaseHelper } from '../services/DatabaseHelper';
import { Video } from '../models/Video';
import { Channel } from '../models/Channel';
import { VideoCard } from '../components/VideoCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const SearchScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'videos' | 'channels'>('videos');
  const [videos, setVideos] = useState<Video[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: 'Search' });
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query.trim());
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeTab]);

  const runSearch = async (q: string) => {
    if (!q) {
      setVideos([]);
      setChannels([]);
      return;
    }
    try {
      setLoading(true);
      if (activeTab === 'videos') {
        const vs = await databaseHelper.searchVideos(q, 100);
        setVideos(vs);
      } else {
        const cs = await databaseHelper.searchChannels(q, 50);
        setChannels(cs);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="text-search" size={80} color="#9ca3af" />
      <Text style={styles.emptyTitle}>{query ? 'No results' : 'Search across your channels'}</Text>
      {!query && <Text style={styles.emptySubtitle}>Find videos and channels you added</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <Searchbar
          placeholder="Search"
          value={query}
          onChangeText={setQuery}
          style={styles.searchBar}
          iconColor="#AAAAAA"
          placeholderTextColor="#717171"
        />
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'videos' && styles.tabActive]}
            onPress={() => setActiveTab('videos')}
          >
            <Text style={[styles.tabText, activeTab === 'videos' && styles.tabTextActive]}>Videos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'channels' && styles.tabActive]}
            onPress={() => setActiveTab('channels')}
          >
            <Text style={[styles.tabText, activeTab === 'channels' && styles.tabTextActive]}>Channels</Text>
          </TouchableOpacity>
        </View>
      </View>

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
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={videos.length === 0 ? styles.emptyList : undefined}
        />
      ) : (
        <FlatList
          data={channels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.channelRow}
              onPress={() => navigation.navigate('ChannelVideos', { channel: item })}
            >
              <View style={styles.channelAvatar} />
              <View style={styles.channelInfo}>
                <Text style={styles.channelName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.channelMeta} numberOfLines={1}>@channel • Added {new Date(item.addedDate).toLocaleDateString()}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={channels.length === 0 ? styles.emptyList : undefined}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  searchBarContainer: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
  searchBar: { backgroundColor: '#212121', borderRadius: 8 },
  tabsRow: { flexDirection: 'row', marginTop: 8 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#212121', borderRadius: 16, marginRight: 8 },
  tabActive: { backgroundColor: '#3D3D3D' },
  tabText: { color: '#AAAAAA', fontWeight: '600' },
  tabTextActive: { color: '#FFFFFF' },
  emptyList: { flexGrow: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, color: '#AAAAAA', marginTop: 16, fontWeight: '500' },
  emptySubtitle: { fontSize: 14, color: '#717171', marginTop: 8 },
  channelRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 12 },
  channelAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#272727' },
  channelInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  channelName: { color: '#F1F1F1', fontSize: 14, fontWeight: '600' },
  channelMeta: { color: '#AAAAAA', fontSize: 12, marginTop: 2 },
});
