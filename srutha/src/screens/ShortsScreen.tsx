import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { useChannel } from '../context/ChannelContext';
import { Video, formatViews } from '../models/Video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width, height } = Dimensions.get('window');

export const ShortsScreen = ({ navigation }: any) => {
  const { videos, markVideoAsWatched } = useChannel();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Filter for shorts (videos under 60 seconds)
  const shorts = videos.filter(v => v.durationSeconds && v.durationSeconds <= 60);

  useEffect(() => {
    if (shorts.length > 0) {
      setPlaying(true);
    }
  }, [currentIndex]);

  const handleStateChange = (state: string) => {
    if (state === 'ended') {
      // Auto-advance to next short
      if (currentIndex < shorts.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }
    }
  };

  const togglePlayPause = () => {
    setPlaying(prev => !prev);
  };

  const handleLike = () => {
    // Placeholder for like functionality
  };

  const handleDislike = () => {
    // Placeholder for dislike functionality
  };

  const handleComment = () => {
    // Placeholder for comment functionality
  };

  const handleShare = () => {
    // Placeholder for share functionality
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        // Mark as watched when viewed
        const video = shorts[newIndex];
        if (video && !video.watched) {
          markVideoAsWatched(video.id);
        }
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const renderShort = ({ item, index }: { item: Video; index: number }) => {
    const isActive = index === currentIndex;

    return (
      <View style={styles.shortContainer}>
        {/* Video Player */}
        <View style={styles.playerContainer}>
          {isActive ? (
            <YoutubePlayer
              height={height}
              width={width}
              play={playing}
              videoId={item.id}
              onChangeState={handleStateChange}
              webViewStyle={styles.webView}
              initialPlayerParams={{
                controls: false,
                modestbranding: true,
                rel: false,
              }}
            />
          ) : (
            <Image
              source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/400x711' }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Play/Pause overlay */}
        <TouchableOpacity
          style={styles.playPauseOverlay}
          onPress={togglePlayPause}
          activeOpacity={1}
        >
          {!playing && (
            <View style={styles.playIconContainer}>
              <Icon name="play" size={80} color="rgba(255, 255, 255, 0.9)" />
            </View>
          )}
        </TouchableOpacity>

        {/* Right side actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Icon name="thumb-up-outline" size={32} color="#FFFFFF" />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleDislike}>
            <Icon name="thumb-down-outline" size={32} color="#FFFFFF" />
            <Text style={styles.actionText}>Dislike</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <Icon name="comment-outline" size={32} color="#FFFFFF" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Icon name="share-outline" size={32} color="#FFFFFF" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Icon name="dots-vertical" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom info */}
        <View style={styles.infoContainer}>
          <View style={styles.channelRow}>
            <View style={styles.channelAvatar}>
              <Icon name="account-circle" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.channelName}>{item.channelName}</Text>
            <TouchableOpacity style={styles.subscribeButton}>
              <Text style={styles.subscribeText}>Subscribe</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {item.viewCount !== undefined && (
            <Text style={styles.views}>{formatViews(item.viewCount)} views</Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="play-box-outline" size={80} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No Shorts available</Text>
      <Text style={styles.emptySubtitle}>
        Shorts are videos under 60 seconds
      </Text>
    </View>
  );

  if (shorts.length === 0) {
    return (
      <View style={styles.container}>
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={shorts}
        keyExtractor={(item) => item.id}
        renderItem={renderShort}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={height}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  shortContainer: {
    width,
    height,
    backgroundColor: '#000000',
  },
  playerContainer: {
    width,
    height,
    position: 'absolute',
  },
  webView: {
    backgroundColor: '#000000',
  },
  thumbnail: {
    width,
    height,
  },
  playPauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 50,
    padding: 20,
  },
  actionsContainer: {
    position: 'absolute',
    right: 12,
    bottom: 120,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  infoContainer: {
    position: 'absolute',
    left: 12,
    right: 80,
    bottom: 20,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  channelName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  subscribeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  views: {
    color: '#CCCCCC',
    fontSize: 12,
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
  emptySubtitle: {
    fontSize: 14,
    color: '#717171',
    marginTop: 8,
    textAlign: 'center',
  },
});
