import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { Video, formatDuration, formatViews, getTimeAgo } from '../models/Video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface VideoCardProps {
  video: Video;
  onPress: () => void;
  onToggleWatched?: () => void;
  showWatchedButton?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  onPress, 
  onToggleWatched,
  showWatchedButton = true,
}) => {
  const handleToggleWatched = (e: any) => {
    e.stopPropagation();
    onToggleWatched?.();
  };

  return (
    <TouchableOpacity 
      style={[styles.card, video.watched && styles.watchedCard]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: video.thumbnailUrl || 'https://via.placeholder.com/320x180' }}
          style={[styles.thumbnail, video.watched && styles.watchedThumbnail]}
          resizeMode="cover"
        />
        {video.durationSeconds && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(video.durationSeconds)}
            </Text>
          </View>
        )}
        {video.watched && (
          <View style={styles.watchedOverlay}>
            <Icon name="check-circle" size={32} color="#10b981" />
          </View>
        )}
      </View>

      {/* Video info */}
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, video.watched && styles.watchedTitle]} numberOfLines={2}>
            {video.title}
          </Text>
          {showWatchedButton && onToggleWatched && (
            <IconButton
              icon={video.watched ? 'eye-check' : 'eye-outline'}
              size={20}
              iconColor={video.watched ? '#10b981' : '#AAAAAA'}
              onPress={handleToggleWatched}
              style={styles.watchedButton}
            />
          )}
        </View>
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F0F0F',
    marginBottom: 16,
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
  watchedThumbnail: {
    opacity: 0.6,
  },
  watchedOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
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
    paddingTop: 8,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: '#F1F1F1',
    lineHeight: 20,
  },
  watchedTitle: {
    color: '#AAAAAA',
  },
  watchedButton: {
    margin: 0,
    marginTop: -8,
    marginRight: -8,
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
});
