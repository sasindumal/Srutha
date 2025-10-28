import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Video, formatDuration, formatViews, getTimeAgo } from '../models/Video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface VideoCardProps {
  video: Video;
  onPress: () => void;
  onToggleWatched?: () => void;
  showWatchedButton?: boolean;
  onMenuPress?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  onPress, 
  onToggleWatched,
  showWatchedButton = false,
  onMenuPress,
}) => {
  const handleToggleWatched = (e: any) => {
    e.stopPropagation();
    onToggleWatched?.();
  };

  const handleMenuPress = (e: any) => {
    e.stopPropagation();
    onMenuPress?.();
  };

  return (
    <TouchableOpacity 
      style={[styles.card, video.watched && styles.watchedCard]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: video.thumbnailUrl || 'https://via.placeholder.com/320x180' }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {video.durationSeconds && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(video.durationSeconds)}
            </Text>
          </View>
        )}
      </View>

      {/* Video info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          {/* Channel avatar placeholder */}
          <View style={styles.channelAvatar}>
            <Icon name="account-circle" size={36} color="#717171" />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={[styles.title, video.watched && styles.watchedTitle]} numberOfLines={2}>
              {video.title}
            </Text>
            <View style={styles.metaContainer}>
              <Text style={styles.channelName} numberOfLines={1}>
                {video.channelName}
              </Text>
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

          {/* Three-dot menu */}
          <IconButton
            icon="dots-vertical"
            size={20}
            iconColor="#AAAAAA"
            onPress={handleMenuPress}
            style={styles.menuButton}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F0F0F',
    marginBottom: 12,
  },
  watchedCard: {
    opacity: 0.7,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#272727',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
  },
  channelAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#212121',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '400',
    color: '#F1F1F1',
    lineHeight: 20,
    marginBottom: 4,
  },
  watchedTitle: {
    color: '#717171',
  },
  metaContainer: {
    flexDirection: 'column',
  },
  channelName: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  menuButton: {
    margin: 0,
    marginTop: -8,
    marginRight: -8,
  },
});
