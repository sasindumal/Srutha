import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { Channel } from '../models/Channel';

interface ChannelCardProps {
  channel: Channel;
  onPress: () => void;
  onLongPress?: () => void;
  onDelete?: () => void;
  onToggleHidden?: () => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  onPress,
  onLongPress,
  onDelete,
  onToggleHidden,
}) => {
  const handleDelete = (e: any) => {
    e.stopPropagation();
    onDelete?.();
  };
  const handleToggleHidden = (e: any) => {
    e.stopPropagation();
    onToggleHidden?.();
  };

  return (
    <TouchableOpacity 
      style={[styles.card, channel.hidden && styles.hiddenCard]} 
      onPress={onPress} 
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.container}>
        {/* Channel thumbnail */}
        <Image
          source={{
            uri: channel?.thumbnailUrl || 'https://via.placeholder.com/88x88',
          }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* Channel info */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.channelName, channel.hidden && styles.hiddenText]} numberOfLines={1}>
              {channel?.name ?? 'Unknown Channel'}
            </Text>
            {onToggleHidden && (
              <IconButton
                icon={channel.hidden ? 'eye' : 'eye-off'}
                size={20}
                iconColor={channel.hidden ? '#3EA6FF' : '#AAAAAA'}
                onPress={handleToggleHidden}
                style={styles.hideButton}
              />
            )}
            {onDelete && (
              <IconButton
                icon="delete-outline"
                size={20}
                iconColor="#FF0000"
                onPress={handleDelete}
                style={styles.deleteButton}
              />
            )}
          </View>

          {/* Subscriber count */}
          {typeof channel?.subscriberCount === 'number' ? (
            <Text style={[styles.subscriberCount, channel.hidden && styles.hiddenText]}>
              {formatSubscribers(channel.subscriberCount)} subscribers
            </Text>
          ) : (
            <Text style={[styles.subscriberCount, channel.hidden && styles.hiddenText]}>0 subscribers</Text>
          )}

          {/* Description */}
          {channel?.description ? (
            <Text style={[styles.description, channel.hidden && styles.hiddenText]} numberOfLines={2}>
              {channel.description}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Safely formats subscriber counts.
 * Handles null, undefined, and non-number values.
 */
const formatSubscribers = (count?: number | null): string => {
  if (count == null || isNaN(count)) return '0';

  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F0F0F',
    marginBottom: 16,
  },
  hiddenCard: {
    opacity: 0.6,
  },
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#272727',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  channelName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#F1F1F1',
  },
  hiddenText: {
    color: '#9E9E9E',
  },
  deleteButton: {
    margin: 0,
    marginRight: -8,
  },
  hideButton: {
    margin: 0,
  },
  subscriberCount: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#717171',
    lineHeight: 16,
  },
});