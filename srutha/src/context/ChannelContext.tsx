import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Channel } from '../models/Channel';
import { Video } from '../models/Video';
import { databaseHelper } from '../services/DatabaseHelper';
import { youtubeService } from '../services/YouTubeService';

interface ChannelContextType {
  channels: Channel[];
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  loadChannels: () => Promise<void>;
  loadVideos: () => Promise<void>;
  addChannel: (channelInput: string) => Promise<boolean>;
  deleteChannel: (channelId: string) => Promise<void>;
  hideChannel: (channelId: string) => Promise<void>;
  unhideChannel: (channelId: string) => Promise<void>;
  fetchChannelVideos: (channelId: string, limit?: number) => Promise<void>;
  loadMoreChannelVideos: (channelId: string, pageSize?: number) => Promise<number>;
  loadMoreForChannels: (channelIds: string[], pageSize?: number) => Promise<number>;
  refreshAllChannels: () => Promise<void>;
  getChannelVideos: (channelId: string) => Promise<Video[]>;
  markVideoAsWatched: (videoId: string) => Promise<void>;
  markVideoAsUnwatched: (videoId: string) => Promise<void>;
  getWatchedVideos: () => Promise<Video[]>;
  getUnwatchedVideos: () => Promise<Video[]>;
}

const ChannelContext = createContext<ChannelContextType | undefined>(undefined);

export const useChannel = () => {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error('useChannel must be used within a ChannelProvider');
  }
  return context;
};

interface ChannelProviderProps {
  children: ReactNode;
}

export const ChannelProvider: React.FC<ChannelProviderProps> = ({ children }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize database on mount
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await databaseHelper.initDatabase();
      await loadChannels();
      await loadVideos();
    } catch (err) {
      setError(`Failed to initialize app: ${err}`);
    }
  };

  const loadChannels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedChannels = await databaseHelper.getAllChannels();
      setChannels(loadedChannels);
    } catch (err) {
      setError(`Failed to load channels: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVideos = async () => {
    try {
      const loadedVideos = await databaseHelper.getAllVideos();
      setVideos(loadedVideos);
    } catch (err) {
      setError(`Failed to load videos: ${err}`);
    }
  };

  const addChannel = async (channelInput: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Get channel info from YouTube
      const channel = await youtubeService.getChannelInfo(channelInput);

      // Check if channel already exists
      if (channel.id) {
        const existingChannel = await databaseHelper.getChannel(channel.id);
        if (existingChannel) {
          setError('Channel already added');
          setIsLoading(false);
          return false;
        }
      }

      // Save to database
      await databaseHelper.insertChannel(channel);

      // Fetch videos for this channel
      if (channel.id) {
        await fetchChannelVideos(channel.id);
      }

      // Reload channels and videos
      await loadChannels();
      await loadVideos();

      setIsLoading(false);
      return true;
    } catch (err) {
      setError(`Failed to add channel: ${err}`);
      setIsLoading(false);
      return false;
    }
  };

  const deleteChannel = async (channelId: string) => {
    try {
      await databaseHelper.deleteChannel(channelId);
      await loadChannels();
      await loadVideos();
    } catch (err) {
      setError(`Failed to delete channel: ${err}`);
    }
  };

  const hideChannel = async (channelId: string) => {
    try {
      await databaseHelper.hideChannel(channelId);
      await loadChannels();
      await loadVideos();
    } catch (err) {
      setError(`Failed to hide channel: ${err}`);
    }
  };

  const unhideChannel = async (channelId: string) => {
    try {
      await databaseHelper.unhideChannel(channelId);
      await loadChannels();
      await loadVideos();
    } catch (err) {
      setError(`Failed to unhide channel: ${err}`);
    }
  };

  const fetchChannelVideos = async (channelId: string, limit: number = 30) => {
    try {
      // reset pagination for fresh fetch
      youtubeService.resetChannelPagination(channelId);
      const videos = await youtubeService.getChannelVideos(channelId, limit);
      await databaseHelper.insertVideos(videos);
      await loadVideos();
    } catch (err) {
      setError(`Failed to fetch videos: ${err}`);
    }
  };

  const loadMoreChannelVideos = async (channelId: string, pageSize: number = 30): Promise<number> => {
    try {
      const more = await youtubeService.getChannelVideosNext(channelId, pageSize);
      if (more.length > 0) {
        await databaseHelper.insertVideos(more);
        await loadVideos();
      }
      return more.length;
    } catch (err) {
      console.warn(`Failed to load more videos for channel ${channelId}:`, err);
      return 0;
    }
  };

  const loadMoreForChannels = async (channelIds: string[], pageSize: number = 30): Promise<number> => {
    let total = 0;
    for (const id of channelIds) {
      const count = await loadMoreChannelVideos(id, pageSize);
      total += count;
    }
    return total;
  };

  const refreshAllChannels = async () => {
    try {
      setIsLoading(true);
      setError(null);

      for (const channel of channels) {
        try {
          await fetchChannelVideos(channel.id);
        } catch (err) {
          // Continue even if one channel fails
          console.error(`Failed to refresh channel ${channel.id}:`, err);
        }
      }

      await loadVideos();
    } catch (err) {
      setError(`Failed to refresh channels: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getChannelVideos = async (channelId: string): Promise<Video[]> => {
    try {
      return await databaseHelper.getChannelVideos(channelId);
    } catch (err) {
      setError(`Failed to get channel videos: ${err}`);
      return [];
    }
  };

  const markVideoAsWatched = async (videoId: string) => {
    try {
      await databaseHelper.markVideoAsWatched(videoId);
      await loadVideos();
    } catch (err) {
      setError(`Failed to mark video as watched: ${err}`);
    }
  };

  const markVideoAsUnwatched = async (videoId: string) => {
    try {
      await databaseHelper.markVideoAsUnwatched(videoId);
      await loadVideos();
    } catch (err) {
      setError(`Failed to mark video as unwatched: ${err}`);
    }
  };

  const getWatchedVideos = async (): Promise<Video[]> => {
    try {
      return await databaseHelper.getWatchedVideos();
    } catch (err) {
      setError(`Failed to get watched videos: ${err}`);
      return [];
    }
  };

  const getUnwatchedVideos = async (): Promise<Video[]> => {
    try {
      return await databaseHelper.getUnwatchedVideos();
    } catch (err) {
      setError(`Failed to get unwatched videos: ${err}`);
      return [];
    }
  };

  const value: ChannelContextType = {
    channels,
    videos,
    isLoading,
    error,
    loadChannels,
    loadVideos,
    addChannel,
    deleteChannel,
  hideChannel,
  unhideChannel,
    fetchChannelVideos,
  loadMoreChannelVideos,
  loadMoreForChannels,
    refreshAllChannels,
    getChannelVideos,
    markVideoAsWatched,
    markVideoAsUnwatched,
    getWatchedVideos,
    getUnwatchedVideos,
  };

  return <ChannelContext.Provider value={value}>{children}</ChannelContext.Provider>;
};
