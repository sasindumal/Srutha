import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { usePlaylist } from '../context/PlaylistContext';

export const EditPlaylistScreen = ({ route, navigation }: any) => {
  const { playlist } = route.params;
  const { updatePlaylist } = usePlaylist();
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    try {
      setIsUpdating(true);
      await updatePlaylist(playlist.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      Alert.alert('Success', 'Playlist updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update playlist');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TextInput
        label="Playlist Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        placeholder="Enter playlist name"
        maxLength={100}
      />

      <TextInput
        label="Description (Optional)"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        style={styles.input}
        placeholder="Enter description"
        multiline
        numberOfLines={4}
        maxLength={500}
      />

      <Button
        mode="contained"
        onPress={handleUpdate}
        loading={isUpdating}
        disabled={isUpdating || !name.trim()}
        style={styles.button}
      >
        Update Playlist
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#212121',
  },
  button: {
    marginTop: 8,
  },
});
