import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { Video, formatDuration, formatViews, getTimeAgo } from '../models/Video';

interface VideoCardProps {
  video: Video;
  onPress: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.container}>
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
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
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
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
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
