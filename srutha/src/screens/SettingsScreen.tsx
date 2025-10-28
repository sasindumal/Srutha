import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { Switch, List } from 'react-native-paper';
import { settingsService, AppSettings } from '../services/SettingsService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const SettingsScreen = ({ navigation }: any) => {
  const [settings, setSettings] = useState<AppSettings>({
    backgroundPlayback: false,
    keepScreenAwake: false,
    autoMarkWatched: true,
    defaultQuality: 'auto',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const loaded = await settingsService.loadSettings();
    setSettings(loaded);
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await settingsService.setSetting(key, value);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Playback</Text>
        
        <List.Item
          title="Background playback"
          description="Continue playing when app is in background or screen is off"
          titleStyle={styles.itemTitle}
          descriptionStyle={styles.itemDescription}
          left={(props) => (
            <View style={styles.iconContainer}>
              <Icon name="play-circle-outline" size={24} color="#FFFFFF" />
            </View>
          )}
          right={() => (
            <Switch
              value={settings.backgroundPlayback}
              onValueChange={(value) => updateSetting('backgroundPlayback', value)}
              color="#FF0000"
            />
          )}
          style={styles.listItem}
        />

        <List.Item
          title="Keep screen awake"
          description="Prevent screen from sleeping during video playback"
          titleStyle={styles.itemTitle}
          descriptionStyle={styles.itemDescription}
          left={(props) => (
            <View style={styles.iconContainer}>
              <Icon name="sleep-off" size={24} color="#FFFFFF" />
            </View>
          )}
          right={() => (
            <Switch
              value={settings.keepScreenAwake}
              onValueChange={(value) => updateSetting('keepScreenAwake', value)}
              color="#FF0000"
            />
          )}
          style={styles.listItem}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>History</Text>
        
        <List.Item
          title="Auto-mark as watched"
          description="Automatically mark videos as watched when played"
          titleStyle={styles.itemTitle}
          descriptionStyle={styles.itemDescription}
          left={(props) => (
            <View style={styles.iconContainer}>
              <Icon name="eye-check-outline" size={24} color="#FFFFFF" />
            </View>
          )}
          right={() => (
            <Switch
              value={settings.autoMarkWatched}
              onValueChange={(value) => updateSetting('autoMarkWatched', value)}
              color="#FF0000"
            />
          )}
          style={styles.listItem}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <List.Item
          title="Srutha"
          description="Version 2.0.0"
          titleStyle={styles.itemTitle}
          descriptionStyle={styles.itemDescription}
          left={(props) => (
            <View style={styles.iconContainer}>
              <Icon name="information-outline" size={24} color="#FFFFFF" />
            </View>
          )}
          style={styles.listItem}
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
