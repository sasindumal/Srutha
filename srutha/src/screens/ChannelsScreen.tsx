import React, { useRef } from 'react';
import { View, FlatList, StyleSheet, Text, Alert, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { FAB, useTheme } from 'react-native-paper';
import { useChannel } from '../context/ChannelContext';
import { ChannelCard } from '../components/ChannelCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const ChannelsScreen = ({ navigation }: any) => {
  const { channels, deleteChannel, hideChannel, unhideChannel } = useChannel();
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
  const theme = useTheme();

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

  const handleToggleHidden = async (channelId: string, hidden: boolean) => {
    if (hidden) {
      await unhideChannel(channelId);
    } else {
      await hideChannel(channelId);
    }
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
              onToggleHidden={() => handleToggleHidden(item.id, item.hidden ?? false)}
            />
          </Swipeable>
        )}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={channels.length === 0 ? styles.emptyList : undefined}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('AddChannel')}
        color="#ffffff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
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
    color: '#AAAAAA',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#717171',
    marginTop: 8,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  deleteAction: {
    backgroundColor: '#FF0000',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    marginVertical: 0,
    marginRight: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  deleteActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
