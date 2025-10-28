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
    <Card style={[styles.card, video.watched && styles.watchedCard]} onPress={onPress}>
      <View style={styles.container}>
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
                iconColor={video.watched ? '#10b981' : '#6b7280'}
                onPress={handleToggleWatched}
                style={styles.watchedButton}
              />
            )}
          </View>
          <Text style={styles.channelName} numberOfLines={1}>
            {video.channelName}
          </Text>
          <View style={styles.metaContainer}>
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
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    elevation: 2,
  },
  watchedCard: {
    opacity: 0.7,
  },
  container: {
    flex: 1,
  },
  thumbnailContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#e5e7eb',
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
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.87)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  infoContainer: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  watchedTitle: {
    color: '#6b7280',
  },
  watchedButton: {
    margin: 0,
    marginTop: -8,
    marginRight: -8,
  },
  channelName: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
