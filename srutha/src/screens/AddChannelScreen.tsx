import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Button, Chip } from 'react-native-paper';
import { useChannel } from '../context/ChannelContext';

export const AddChannelScreen = ({ navigation }: any) => {
  const [channelInput, setChannelInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { addChannel, error } = useChannel();

  const handleAddChannel = async () => {
    if (!channelInput.trim()) {
      Alert.alert('Error', 'Please enter a channel URL or handle');
      return;
    }

    setIsAdding(true);
    const success = await addChannel(channelInput.trim());
    setIsAdding(false);

    if (success) {
      Alert.alert('Success', 'Channel added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Error', error || 'Failed to add channel');
    }
  };

  const handleExamplePress = (example: string) => {
    setChannelInput(example);
  };

  const examples = [
    '@mkbhd',
    'youtube.com/@LinusTechTips',
    'youtube.com/channel/UCBJycsmduvYEL83R_U4JriQ',
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.label}>Enter YouTube Channel URL</Text>
      <Text style={styles.helpText}>
        You can use:{'\n'}
        • Channel URL: youtube.com/channel/UC...{'\n'}
        • Handle: youtube.com/@username{'\n'}
        • Username: youtube.com/c/username{'\n'}
        • Just the handle: @username
      </Text>

      <TextInput
        style={styles.input}
        placeholder="@channel or youtube.com/channel/..."
        value={channelInput}
        onChangeText={setChannelInput}
        editable={!isAdding}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button
        mode="contained"
        onPress={handleAddChannel}
        disabled={isAdding}
        style={styles.addButton}
        contentStyle={styles.addButtonContent}
      >
        {isAdding ? <ActivityIndicator color="#ffffff" /> : 'Add Channel'}
      </Button>

      <View style={styles.divider} />

      <Text style={styles.examplesTitle}>Examples:</Text>
      <View style={styles.examplesContainer}>
        {examples.map((example) => (
          <Chip
            key={example}
            icon="content-copy"
            onPress={() => handleExamplePress(example)}
            disabled={isAdding}
            style={styles.exampleChip}
          >
            {example}
          </Chip>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  contentContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F1F1F1',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#AAAAAA',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#212121',
    borderWidth: 1,
    borderColor: '#3F3F3F',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    color: '#F1F1F1',
  },
  addButton: {
    marginBottom: 16,
  },
  addButtonContent: {
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#3F3F3F',
    marginVertical: 16,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#AAAAAA',
    marginBottom: 8,
  },
  examplesContainer: {
    gap: 8,
  },
  exampleChip: {
    marginBottom: 8,
  },
});
