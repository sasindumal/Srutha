import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, Alert } from 'react-native';
import { FAB, Card, IconButton, useTheme } from 'react-native-paper';
import { usePlaylist } from '../context/PlaylistContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const PlaylistsScreen = ({ navigation }: any) => {
  const { playlists, loadPlaylists, deletePlaylist } = usePlaylist();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlaylists();
    setRefreshing(false);
  };

  const handleDeletePlaylist = (playlistId: string, playlistName: string) => {
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlistName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePlaylist(playlistId),
        },
      ]
    );
  };

  const handleCreatePlaylist = () => {
    navigation.navigate('CreatePlaylist');
  };

  const handleEditPlaylist = (playlist: any) => {
    navigation.navigate('EditPlaylist', { playlist });
  };

  const renderPlaylistCard = ({ item }: any) => (
    <Card style={styles.card} onPress={() => navigation.navigate('PlaylistVideos', { playlist: item })}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Icon name="playlist-music" size={40} color={theme.colors.primary} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.playlistName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.videoCount}>
            {item.videoCount || 0} video{item.videoCount !== 1 ? 's' : ''}
          </Text>
          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <View style={styles.actionsContainer}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => handleEditPlaylist(item)}
          />
          <IconButton
            icon="delete-outline"
            size={20}
            iconColor="#ef4444"
            onPress={() => handleDeletePlaylist(item.id, item.name)}
          />
        </View>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="playlist-music" size={80} color="#9ca3af" />
      <Text style={styles.emptyTitle}>No playlists yet</Text>
      <Text style={styles.emptySubtitle}>Create a playlist to organize your videos</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylistCard}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={playlists.length === 0 ? styles.emptyList : undefined}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleCreatePlaylist}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  card: {
    marginHorizontal: 0,
    marginVertical: 0,
    marginBottom: 12,
    elevation: 0,
    backgroundColor: '#0F0F0F',
    borderRadius: 0,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#272727',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  playlistName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#F1F1F1',
    marginBottom: 4,
  },
  videoCount: {
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#717171',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
