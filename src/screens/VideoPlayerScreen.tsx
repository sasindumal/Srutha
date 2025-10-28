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
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { IconButton, useTheme, ActivityIndicator, Button, TextInput, ProgressBar } from 'react-native-paper';
import { Video } from '../models/Video';
import { formatViews, getTimeAgo } from '../models/Video';
import { usePlaylist } from '../context/PlaylistContext';
import { useChannel } from '../context/ChannelContext';
import { Playlist } from '../models/Playlist';
import { videoDownloadService, DownloadProgress } from '../services/VideoDownloadService';
import { settingsService } from '../services/SettingsService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const VideoPlayerScreen = ({ route }: any) => {
  const { video } = route.params as { video: Video };
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [videoPlaylists, setVideoPlaylists] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const theme = useTheme();
  
  const { 
    playlists, 
    loadPlaylists, 
    addVideoToPlaylist, 
    removeVideoFromPlaylist,
    getVideoPlaylists,
    createPlaylist,
  } = usePlaylist();

  const { markVideoAsWatched } = useChannel();

  useEffect(() => {
    loadPlaylists();
    loadVideoPlaylists();
    
    let cleanup: (() => void) | undefined;
    
    const init = async () => {
      const settings = await settingsService.getSettings();
      
      // Handle keep screen awake
      if (settings.keepScreenAwake) {
        await activateKeepAwakeAsync('video-player');
        cleanup = () => deactivateKeepAwake('video-player');
      }
    };
    
    init();
    
    return () => {
      if (cleanup) cleanup();
    };
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

  const onStateChange = useCallback(async (state: string) => {
    if (state === 'ended') {
      setIsPlaying(false);
      // Check if auto-mark watched is enabled
      const settings = await settingsService.getSettings();
      if (settings.autoMarkWatched) {
        markVideoAsWatched(video.id).catch(error => {
          console.error('Error marking video as watched:', error);
        });
      }
    } else if (state === 'playing') {
      setIsPlaying(true);
    } else if (state === 'paused') {
      setIsPlaying(false);
    }
  }, [video.id, markVideoAsWatched]);

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
    setShowCreateForm(true);
  };

  const submitCreatePlaylist = async () => {
    const name = newPlaylistName.trim();
    if (!name) {
      Alert.alert('Create Playlist', 'Please enter a name');
      return;
    }
    try {
      setCreatingPlaylist(true);
      const newPlaylistId = await createPlaylist({ name });
      await addVideoToPlaylist(newPlaylistId, video.id);
      await loadPlaylists();
      await loadVideoPlaylists();
      setNewPlaylistName('');
      setShowCreateForm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create playlist');
    } finally {
      setCreatingPlaylist(false);
    }
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
    if (isDownloading) {
      // Cancel download
      Alert.alert(
        'Cancel Download',
        'Are you sure you want to cancel this download?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              await videoDownloadService.cancelDownload(video.id);
              setIsDownloading(false);
              setDownloadProgress(0);
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Download Video',
      'To download YouTube videos, you need to:\n\n' +
      '1. Set up a backend extractor service (using youtube-dl or NewPipe Extractor)\n' +
      '2. Or use YouTube Premium\'s offline feature\n\n' +
      'Note: Direct downloading may violate YouTube\'s Terms of Service.\n\n' +
      'Would you like to open this video in YouTube instead?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open in YouTube', onPress: handleOpenInYouTube },
        {
          text: 'Try Download (Demo)',
          onPress: handleDownloadDemo,
        },
      ]
    );
  };

  const handleDownloadDemo = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const onProgress = (progress: DownloadProgress) => {
        setDownloadProgress(progress.progress);
      };

      // This will show an error about needing backend setup
      // In production, you'd call: videoDownloadService.downloadVideoWithExtractor()
      await videoDownloadService.downloadVideoWithExtractor(
        video.id,
        video.title,
        '720p',
        onProgress
      );

      Alert.alert('Success', 'Video downloaded successfully!');
    } catch (error: any) {
      Alert.alert(
        'Download Failed',
        error.message || 'Failed to download video. Please set up a backend extractor service.'
      );
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* YouTube Video Player */}
        <View style={styles.videoContainer}>
          {videoId ? (
            <YoutubePlayer
              height={(SCREEN_WIDTH * 9) / 16}
              play={isPlaying}
              videoId={videoId}
              onChangeState={onStateChange}
              webViewProps={{
                allowsInlineMediaPlayback: true,
                mediaPlaybackRequiresUserAction: false,
              }}
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
        </View>

        {/* Action buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddToPlaylist}>
            <IconButton icon="playlist-plus" size={24} iconColor="#F1F1F1" />
            <Text style={styles.actionText}>Playlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <IconButton icon="share-variant" size={24} iconColor="#F1F1F1" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size={24} color="#F1F1F1" style={{ marginVertical: 8 }} />
              ) : (
                <IconButton icon="download" size={24} iconColor="#F1F1F1" />
              )}
              <Text style={styles.actionText}>
                {isDownloading ? 'Downloading...' : 'Download'}
              </Text>
            </TouchableOpacity>
        </View>

        {/* Download Progress Bar */}
        {isDownloading && downloadProgress > 0 && (
          <View style={styles.downloadProgressContainer}>
            <Text style={styles.downloadProgressText}>
              Downloading: {Math.round(downloadProgress * 100)}%
            </Text>
            <ProgressBar progress={downloadProgress} color={theme.colors.primary} />
          </View>
        )}

        {/* Description */}
        <View style={styles.descriptionWrapper}>
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

            {!showCreateForm ? (
              <Button
                mode="outlined"
                icon="plus"
                onPress={handleCreateNewPlaylist}
                style={styles.createPlaylistButton}
              >
                Create New Playlist
              </Button>
            ) : (
              <View style={styles.createFormContainer}>
                <Text style={styles.createFormLabel}>Playlist name</Text>
                <TextInput
                  mode="outlined"
                  value={newPlaylistName}
                  onChangeText={setNewPlaylistName}
                  placeholder="My playlist"
                  style={styles.createFormInput}
                  outlineColor="#3F3F3F"
                  activeOutlineColor="#3EA6FF"
                  textColor="#F1F1F1"
                  placeholderTextColor="#717171"
                />
                <View style={styles.createFormActions}>
                  <Button
                    mode="text"
                    onPress={() => {
                      setShowCreateForm(false);
                      setNewPlaylistName('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    mode="contained"
                    onPress={submitCreatePlaylist}
                    loading={creatingPlaylist}
                    disabled={creatingPlaylist}
                  >
                    Save
                  </Button>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
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
    backgroundColor: '#000000',
  },
  placeholderText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  openYouTubeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 18,
  },
  openYouTubeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '400',
    color: '#F1F1F1',
    marginBottom: 8,
    lineHeight: 22,
  },
  metaContainer: {
    marginBottom: 4,
  },
  channelName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F1F1F1',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 4,
    backgroundColor: '#0F0F0F',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 11,
    color: '#F1F1F1',
    marginTop: -8,
  },
  downloadProgressContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#212121',
    borderRadius: 8,
  },
  downloadProgressText: {
    fontSize: 13,
    color: '#F1F1F1',
    marginBottom: 8,
    fontWeight: '400',
  },
  descriptionWrapper: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  descriptionContainer: {
    backgroundColor: '#212121',
    padding: 12,
    borderRadius: 8,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F1F1F1',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#AAAAAA',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#212121',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    borderBottomColor: '#3F3F3F',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F1F1',
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
    color: '#F1F1F1',
    marginBottom: 2,
  },
  playlistVideoCount: {
    fontSize: 13,
    color: '#AAAAAA',
  },
  emptyPlaylistText: {
    textAlign: 'center',
    color: '#717171',
    padding: 32,
    fontSize: 14,
  },
  createPlaylistButton: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  createFormContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 8,
  },
  createFormLabel: {
    color: '#F1F1F1',
    fontSize: 14,
    fontWeight: '500',
  },
  createFormInput: {
    backgroundColor: '#212121',
  },
  createFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
});
