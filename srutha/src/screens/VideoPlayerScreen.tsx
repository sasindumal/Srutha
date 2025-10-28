import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
  Alert,
  Share,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { IconButton, useTheme, ActivityIndicator, Button, TextInput } from 'react-native-paper';
import { Video } from '../models/Video';
import { formatViews, getTimeAgo } from '../models/Video';
import { usePlaylist } from '../context/PlaylistContext';
import { Playlist } from '../models/Playlist';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const VideoPlayerScreen = ({ route }: any) => {
  const { video } = route.params as { video: Video };
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [videoPlaylists, setVideoPlaylists] = useState<string[]>([]);
  const theme = useTheme();
  
  const { 
    playlists, 
    loadPlaylists, 
    addVideoToPlaylist, 
    removeVideoFromPlaylist,
    getVideoPlaylists,
    createPlaylist,
  } = usePlaylist();

  useEffect(() => {
    loadPlaylists();
    loadVideoPlaylists();
  }, []);

  const loadVideoPlaylists = async () => {
    const videoInPlaylists = await getVideoPlaylists(video.id);
    setVideoPlaylists(videoInPlaylists.map(p => p.id));
  };

  // Extract video ID from URL
  const getVideoId = (url: string): string => {
    const match = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|$)/);
    return match ? match[1] : '';
  };

  const videoId = getVideoId(video.url);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      setIsPlaying(false);
    } else if (state === 'playing') {
      setIsPlaying(true);
    } else if (state === 'paused') {
      setIsPlaying(false);
    }
  }, []);

  const handleOpenInYouTube = () => {
    Linking.openURL(video.url);
  };

  const handleLike = () => {
    // Open YouTube video in browser where user can like
    Alert.alert(
      'Like Video',
      'Open this video in YouTube to like it?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open YouTube', onPress: handleOpenInYouTube },
      ]
    );
  };

  const handleAddToPlaylist = () => {
    setShowPlaylistModal(true);
  };

  const handlePlaylistToggle = async (playlistId: string) => {
    try {
      if (videoPlaylists.includes(playlistId)) {
        await removeVideoFromPlaylist(playlistId, video.id);
        setVideoPlaylists(videoPlaylists.filter(id => id !== playlistId));
      } else {
        await addVideoToPlaylist(playlistId, video.id);
        setVideoPlaylists([...videoPlaylists, playlistId]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update playlist');
    }
  };

  const handleCreateNewPlaylist = () => {
    Alert.prompt(
      'Create Playlist',
      'Enter playlist name:',
      async (text) => {
        if (text && text.trim()) {
          try {
            const newPlaylistId = await createPlaylist({ name: text.trim() });
            await addVideoToPlaylist(newPlaylistId, video.id);
            await loadPlaylists();
            await loadVideoPlaylists();
          } catch (error) {
            Alert.alert('Error', 'Failed to create playlist');
          }
        }
      },
      'plain-text'
    );
  };

  const handleShare = async () => {
    try {
      const message = `${video.title}\n${video.url}`;
      
      if (Platform.OS === 'web') {
        // For web, use native share if available, otherwise copy to clipboard
        if ('share' in navigator && typeof (navigator as any).share === 'function') {
          await (navigator as any).share({
            title: video.title,
            url: video.url,
          });
        } else {
          Alert.alert('Share', message);
        }
      } else {
        // For mobile, use React Native Share
        await Share.share({
          message,
          url: video.url,
          title: video.title,
        });
      }
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        Alert.alert('Error', 'Failed to share video');
      }
    }
  };

  const handleDownload = async () => {
    Alert.alert(
      'Download Video',
      'Note: Direct video download requires YouTube Premium or third-party services. Would you like to open this video in YouTube?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open in YouTube', onPress: handleOpenInYouTube },
      ]
    );
    
    // Note: Downloading YouTube videos programmatically violates YouTube's Terms of Service
    // For legitimate downloads, users should:
    // 1. Use YouTube Premium's offline feature
    // 2. Use authorized third-party services
    // 3. Only download videos they have rights to
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* YouTube Video Player */}
        <View style={styles.videoContainer}>
          {videoId ? (
            <YoutubePlayer
              height={(SCREEN_WIDTH * 9) / 16}
              play={isPlaying}
              videoId={videoId}
              onChangeState={onStateChange}
            />
          ) : (
            <View style={styles.placeholderVideo}>
              <Text style={styles.placeholderText}>
                Invalid Video ID
              </Text>
              <TouchableOpacity
                style={[styles.openYouTubeButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleOpenInYouTube}
              >
                <Text style={styles.openYouTubeButtonText}>Open in YouTube</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Video Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{video.title}</Text>

          {/* Channel and meta info */}
          <View style={styles.metaContainer}>
            <Text style={styles.channelName}>{video.channelName}</Text>
            <View style={styles.metaRow}>
              {video.viewCount !== undefined && (
                <Text style={styles.metaText}>{formatViews(video.viewCount)}</Text>
              )}
              {video.viewCount !== undefined && video.uploadDate && (
                <Text style={styles.metaText}> • </Text>
              )}
              {video.uploadDate && (
                <Text style={styles.metaText}>{getTimeAgo(video.uploadDate)}</Text>
              )}
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddToPlaylist}>
              <IconButton icon="playlist-plus" size={24} />
              <Text style={styles.actionText}>Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <IconButton icon="share-variant" size={24} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size={24} style={{ marginVertical: 8 }} />
              ) : (
                <IconButton icon="download" size={24} />
              )}
              <Text style={styles.actionText}>
                {isDownloading ? 'Downloading...' : 'Download'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          {video.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{video.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Playlist Selection Modal */}
      <Modal
        visible={showPlaylistModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Playlist</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setShowPlaylistModal(false)}
              />
            </View>

            <FlatList
              data={playlists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.playlistItem}
                  onPress={() => handlePlaylistToggle(item.id)}
                >
                  <IconButton
                    icon={videoPlaylists.includes(item.id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={24}
                    iconColor={videoPlaylists.includes(item.id) ? theme.colors.primary : '#6b7280'}
                  />
                  <View style={styles.playlistInfo}>
                    <Text style={styles.playlistName}>{item.name}</Text>
                    <Text style={styles.playlistVideoCount}>
                      {item.videoCount || 0} videos
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyPlaylistText}>No playlists yet</Text>
              }
            />

            <Button
              mode="outlined"
              icon="plus"
              onPress={handleCreateNewPlaylist}
              style={styles.createPlaylistButton}
            >
              Create New Playlist
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
  },
  placeholderVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f2937',
  },
  placeholderText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  openYouTubeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  openYouTubeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  metaContainer: {
    marginBottom: 16,
  },
  channelName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: -8,
  },
  descriptionContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  playlistVideoCount: {
    fontSize: 13,
    color: '#6b7280',
  },
  emptyPlaylistText: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: 32,
    fontSize: 14,
  },
  createPlaylistButton: {
    marginHorizontal: 16,
    marginTop: 12,
  },
});
