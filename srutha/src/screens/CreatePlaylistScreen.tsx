import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, useTheme } from 'react-native-paper';
import { usePlaylist } from '../context/PlaylistContext';

export const CreatePlaylistScreen = ({ navigation }: any) => {
  const { createPlaylist } = usePlaylist();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    try {
      setIsCreating(true);
      await createPlaylist({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      Alert.alert('Success', 'Playlist created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create playlist');
    } finally {
      setIsCreating(false);
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
        onPress={handleCreate}
        loading={isCreating}
        disabled={isCreating || !name.trim()}
        style={styles.button}
      >
        Create Playlist
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
