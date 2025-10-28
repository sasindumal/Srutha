import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@srutha_settings';

export interface AppSettings {
  backgroundPlayback: boolean;
  keepScreenAwake: boolean;
  autoMarkWatched: boolean;
  defaultQuality: 'auto' | 'high' | 'medium' | 'low';
}

const defaultSettings: AppSettings = {
  backgroundPlayback: false,
  keepScreenAwake: false,
  autoMarkWatched: true,
  defaultQuality: 'auto',
};

class SettingsService {
  private settings: AppSettings = defaultSettings;

  async loadSettings(): Promise<AppSettings> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        this.settings = { ...defaultSettings, ...JSON.parse(stored) };
      }
      return this.settings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return defaultSettings;
    }
  }

  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      this.settings = { ...this.settings, ...settings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async getBackgroundPlayback(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem('background_playback');
      return value === 'true'; // Default to false
    } catch {
      return false;
    }
  }

  async setBackgroundPlayback(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('background_playback', enabled.toString());
    } catch (error) {
      console.error('Error saving background playback setting:', error);
    }
  }

  async getKeepAwake(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem('keep_awake');
      return value === 'true'; // Default to false
    } catch {
      return false;
    }
  }

  async setKeepAwake(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('keep_awake', enabled.toString());
    } catch (error) {
      console.error('Error saving keep awake setting:', error);
    }
  }

  async getAutoMarkWatched(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem('auto_mark_watched');
      return value !== 'false'; // Default to true
    } catch {
      return true;
    }
  }

  async setAutoMarkWatched(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('auto_mark_watched', enabled.toString());
    } catch (error) {
      console.error('Error saving auto mark watched setting:', error);
    }
  }

  async getNotificationsEnabled(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem('notifications_enabled');
      return value !== 'false'; // Default to true
    } catch {
      return true;
    }
  }

  async setNotificationsEnabled(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('notifications_enabled', enabled.toString());
    } catch (error) {
      console.error('Error saving notifications setting:', error);
    }
  }
}

export const settingsService = new SettingsService();
