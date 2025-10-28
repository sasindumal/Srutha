import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, FlatList, Image, StatusBar } from 'react-native';
import { useChannel } from '../context/ChannelContext';
import { Video, formatViews } from '../models/Video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width, height: screenHeight } = Dimensions.get('window');
const PLAYER_HEIGHT = screenHeight;

export const ShortsScreen = ({ navigation }: any) => {
  const { videos, markVideoAsWatched } = useChannel();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playingStates, setPlayingStates] = useState<{ [key: number]: boolean }>({});
  const flatListRef = useRef<FlatList>(null);

  // Filter for shorts (videos under 60 seconds)
  const shorts = videos.filter(v => v.durationSeconds && v.durationSeconds <= 60);

  useEffect(() => {
    // Auto-play first video immediately
    if (shorts.length > 0) {
      // Small delay to ensure player is mounted
      setTimeout(() => {
        setPlayingStates({ 0: true });
      }, 300);
    }
    // Set status bar to light for dark background
    StatusBar.setBarStyle('light-content');
    return () => {
      StatusBar.setBarStyle('dark-content');
    };
  }, [shorts.length]);

  const onStateChange = useCallback((state: string, index: number) => {
    if (state === 'ended' && index === currentIndex) {
      // Auto-advance to next short
      if (currentIndex < shorts.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }
    }
  }, [currentIndex, shorts.length]);

  const togglePlayPause = (index: number) => {
    setPlayingStates(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== currentIndex) {
        // Pause all videos
        setPlayingStates({});
        // Play only the current video
        setTimeout(() => {
          setPlayingStates({ [newIndex]: true });
          setCurrentIndex(newIndex);
          
          // Mark as watched
          const video = shorts[newIndex];
          if (video && !video.watched) {
            markVideoAsWatched(video.id);
          }
        }, 100);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 75,
    minimumViewTime: 100,
  }).current;

  const renderShort = ({ item, index }: { item: Video; index: number }) => {
    const isActive = index === currentIndex;
    const isPlaying = playingStates[index] || false;

    return (
      <View style={styles.shortContainer}>
        {/* Video Player */}
        <View style={styles.playerContainer}>
          {isActive ? (
            <YoutubePlayer
              height={PLAYER_HEIGHT}
              width={width}
              play={isPlaying}
              videoId={item.id}
              onChangeState={(state: string) => onStateChange(state, index)}
              webViewStyle={styles.webView}
              mute={false}
              volume={100}
              webViewProps={{
                androidLayerType: "hardware",
                allowsInlineMediaPlayback: true,
                mediaPlaybackRequiresUserAction: false,
                javaScriptEnabled: true,
                domStorageEnabled: true,
                injectedJavaScript: `
                  var element = document.getElementsByClassName('container')[0];
                  if (element) {
                    element.style.position = 'unset';
                    element.style.paddingBottom = 'unset';
                  }
                  true;
                `,
              }}
              initialPlayerParams={{
                controls: false,
                modestbranding: 1,
                rel: 0,
                loop: 0,
                showinfo: 0,
                iv_load_policy: 3,
                cc_load_policy: 0,
                fs: 0,
                playsinline: 1,
                enablejsapi: 1,
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
          onPress={() => togglePlayPause(index)}
          activeOpacity={1}
        >
          {!isPlaying && isActive && (
            <View style={styles.playIconContainer}>
              <Icon name="play" size={80} color="rgba(255, 255, 255, 0.9)" />
            </View>
          )}
        </TouchableOpacity>

        {/* Right side actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Icon name="thumb-up-outline" size={32} color="#FFFFFF" />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Icon name="thumb-down-outline" size={32} color="#FFFFFF" />
            <Text style={styles.actionText}>Dislike</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Icon name="comment-outline" size={32} color="#FFFFFF" />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
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
        snapToInterval={PLAYER_HEIGHT}
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
    height: PLAYER_HEIGHT,
    backgroundColor: '#000000',
  },
  playerContainer: {
    width,
    height: PLAYER_HEIGHT,
    position: 'absolute',
  },
  webView: {
    backgroundColor: '#000000',
  },
  thumbnail: {
    width,
    height: PLAYER_HEIGHT,
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
