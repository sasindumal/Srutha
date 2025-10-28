import React, { useRef } from 'react';
import { View, FlatList, StyleSheet, Text, Alert, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useChannel } from '../context/ChannelContext';
import { ChannelCard } from '../components/ChannelCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ChannelsScreen = ({ navigation }: any) => {
  const { channels, deleteChannel } = useChannel();
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const handleDeleteChannel = (channelId: string, channelName: string) => {
    Alert.alert(
      'Delete Channel',
      `Are you sure you want to delete "${channelName}"? This will also remove all its videos.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // Close the swipeable
            swipeableRefs.current.get(channelId)?.close();
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteChannel(channelId);
            swipeableRefs.current.delete(channelId);
          },
        },
      ]
    );
  };

  const renderRightActions = (channelId: string, channelName: string, progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.rightAction,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeleteChannel(channelId, channelName)}
        >
          <Icon name="delete" size={24} color="#ffffff" />
          <Text style={styles.deleteActionText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="youtube-subscription" size={80} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No channels</Text>
      <Text style={styles.emptySubtitle}>Add a channel to get started</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            ref={(ref) => {
              if (ref) {
                swipeableRefs.current.set(item.id, ref);
              }
            }}
            renderRightActions={(progress, dragX) =>
              renderRightActions(item.id, item.name, progress, dragX)
            }
            overshootRight={false}
            rightThreshold={40}
          >
            <ChannelCard
              channel={item}
              onPress={() =>
                navigation.navigate('ChannelVideos', { channel: item })
              }
              onDelete={() => handleDeleteChannel(item.id, item.name)}
            />
          </Swipeable>
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={channels.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#4b5563',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteAction: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    marginVertical: 6,
    marginRight: 12,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  deleteActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
