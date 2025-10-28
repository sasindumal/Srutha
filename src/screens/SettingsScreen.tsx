import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Switch, List } from 'react-native-paper';
import { settingsService, AppSettings } from '../services/SettingsService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const SettingsScreen = ({ navigation }: any) => {
  const [backgroundPlayback, setBackgroundPlayback] = useState(false);
  const [keepAwake, setKeepAwake] = useState(false);
  const [autoMarkWatched, setAutoMarkWatched] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const bgPlayback = await settingsService.getBackgroundPlayback();
    const keepAwakeEnabled = await settingsService.getKeepAwake();
    const autoMark = await settingsService.getAutoMarkWatched();
    const notifEnabled = await settingsService.getNotificationsEnabled();
    
    setBackgroundPlayback(bgPlayback);
    setKeepAwake(keepAwakeEnabled);
    setAutoMarkWatched(autoMark);
    setNotificationsEnabled(notifEnabled);
  };

  const handleBackgroundPlaybackToggle = async (value: boolean) => {
    setBackgroundPlayback(value);
    await settingsService.setBackgroundPlayback(value);
  };

  const handleKeepAwakeToggle = async (value: boolean) => {
    setKeepAwake(value);
    await settingsService.setKeepAwake(value);
  };

  const handleAutoMarkWatchedToggle = async (value: boolean) => {
    setAutoMarkWatched(value);
    await settingsService.setAutoMarkWatched(value);
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await settingsService.setNotificationsEnabled(value);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PLAYBACK</Text>
        
        <List.Item
          title="Background Playback"
          description="Keep playing when app is in background (limited)"
          titleStyle={styles.itemTitle}
          descriptionStyle={styles.itemDescription}
          style={styles.listItem}
          left={() => (
            <View style={styles.iconContainer}>
              <Icon name="play-circle-outline" size={24} color="#FFFFFF" />
            </View>
          )}
          right={() => (
            <Switch
              value={backgroundPlayback}
              onValueChange={handleBackgroundPlaybackToggle}
              color="#FF0000"
            />
          )}
        />

        <List.Item
          title="Keep Screen Awake"
          description="Prevent screen from dimming during playback"
          titleStyle={styles.itemTitle}
          descriptionStyle={styles.itemDescription}
          style={styles.listItem}
          left={() => (
            <View style={styles.iconContainer}>
              <Icon name="eye-outline" size={24} color="#FFFFFF" />
            </View>
          )}
          right={() => (
            <Switch
              value={keepAwake}
              onValueChange={handleKeepAwakeToggle}
              color="#FF0000"
            />
          )}
        />

        <List.Item
          title="Auto-mark as Watched"
          description="Mark videos as watched when playback completes"
          titleStyle={styles.itemTitle}
          descriptionStyle={styles.itemDescription}
          style={styles.listItem}
          left={() => (
            <View style={styles.iconContainer}>
              <Icon name="check-circle-outline" size={24} color="#FFFFFF" />
            </View>
          )}
          right={() => (
            <Switch
              value={autoMarkWatched}
              onValueChange={handleAutoMarkWatchedToggle}
              color="#FF0000"
            />
          )}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        
        <List.Item
          title="Push Notifications"
          description="Get notified when new videos are available"
          titleStyle={styles.itemTitle}
          descriptionStyle={styles.itemDescription}
          style={styles.listItem}
          left={() => (
            <View style={styles.iconContainer}>
              <Icon name="bell-outline" size={24} color="#FFFFFF" />
            </View>
          )}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              color="#FF0000"
            />
          )}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AAAAAA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
  listItem: {
    backgroundColor: '#0F0F0F',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#272727',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  itemTitle: {
    color: '#F1F1F1',
    fontSize: 15,
    fontWeight: '500',
  },
  itemDescription: {
    color: '#AAAAAA',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#272727',
    marginVertical: 8,
  },
});
