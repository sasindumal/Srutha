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

  async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    if (!this.settings) {
      await this.loadSettings();
    }
    return this.settings[key];
  }

  async setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    await this.saveSettings({ [key]: value } as Partial<AppSettings>);
  }

  getSettings(): AppSettings {
    return this.settings;
  }
}

export const settingsService = new SettingsService();
