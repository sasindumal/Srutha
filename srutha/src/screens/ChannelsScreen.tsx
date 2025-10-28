import React, { useRef } from 'react';
import { View, FlatList, StyleSheet, Text, Alert, TouchableOpacity, Animated, ScrollView, Image } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { FAB, useTheme } from 'react-native-paper';
import { useChannel } from '../context/ChannelContext';
import { ChannelCard } from '../components/ChannelCard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTabSwipe } from '../hooks/useTabSwipe';

export const ChannelsScreen = ({ navigation }: any) => {
  const { channels, deleteChannel, hideChannel, unhideChannel } = useChannel();
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());
  const theme = useTheme();
  const panHandlers = useTabSwipe(navigation);

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

  const renderChannelAvatar = ({ item }: any) => (
    <TouchableOpacity
      style={styles.avatarContainer}
      onPress={() => navigation.navigate('ChannelVideos', { channel: item })}
    >
      <View style={styles.avatar}>
        {item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} style={styles.avatarImage} />
        ) : (
          <Icon name="account-circle" size={56} color="#717171" />
        )}
      </View>
      <Text style={styles.avatarName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="youtube-subscription" size={80} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No subscriptions</Text>
      <Text style={styles.emptySubtitle}>Add channels to see their latest videos</Text>
    </View>
  );

  return (
    <View style={styles.container} {...panHandlers}>
      {channels.length > 0 && (
        <View style={styles.horizontalSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {channels.map((item) => (
              <View key={item.id}>
                {renderChannelAvatar({ item })}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>All subscriptions</Text>
      </View>

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
  horizontalSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#272727',
  },
  horizontalScroll: {
    paddingHorizontal: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 72,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarName: {
    fontSize: 11,
    color: '#F1F1F1',
    textAlign: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#272727',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F1F1F1',
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
