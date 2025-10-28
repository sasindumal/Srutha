import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Playlist, PlaylistInput } from '../models/Playlist';
import { Video } from '../models/Video';
import { databaseHelper } from '../services/DatabaseHelper';

interface PlaylistContextType {
  playlists: Playlist[];
  isLoading: boolean;
  error: string | null;
  loadPlaylists: () => Promise<void>;
  createPlaylist: (playlist: PlaylistInput) => Promise<string>;
  updatePlaylist: (id: string, playlist: Partial<PlaylistInput>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addVideoToPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;
  getPlaylistVideos: (playlistId: string) => Promise<Video[]>;
  isVideoInPlaylist: (playlistId: string, videoId: string) => Promise<boolean>;
  getVideoPlaylists: (videoId: string) => Promise<Playlist[]>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
};

interface PlaylistProviderProps {
  children: ReactNode;
}

export const PlaylistProvider: React.FC<PlaylistProviderProps> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlaylists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedPlaylists = await databaseHelper.getAllPlaylists();
      setPlaylists(loadedPlaylists);
    } catch (err) {
      setError(`Failed to load playlists: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createPlaylist = async (playlist: PlaylistInput): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      const id = await databaseHelper.insertPlaylist(playlist);
      await loadPlaylists();
      return id;
    } catch (err) {
      setError(`Failed to create playlist: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePlaylist = async (id: string, playlist: Partial<PlaylistInput>) => {
    try {
      setIsLoading(true);
      setError(null);
      await databaseHelper.updatePlaylist(id, playlist);
      await loadPlaylists();
    } catch (err) {
      setError(`Failed to update playlist: ${err}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await databaseHelper.deletePlaylist(id);
      await loadPlaylists();
    } catch (err) {
      setError(`Failed to delete playlist: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addVideoToPlaylist = async (playlistId: string, videoId: string) => {
    try {
      setError(null);
      await databaseHelper.addVideoToPlaylist({ playlistId, videoId });
      await loadPlaylists();
    } catch (err) {
      setError(`Failed to add video to playlist: ${err}`);
      throw err;
    }
  };

  const removeVideoFromPlaylist = async (playlistId: string, videoId: string) => {
    try {
      setError(null);
      await databaseHelper.removeVideoFromPlaylist(playlistId, videoId);
      await loadPlaylists();
    } catch (err) {
      setError(`Failed to remove video from playlist: ${err}`);
      throw err;
    }
  };

  const getPlaylistVideos = async (playlistId: string): Promise<Video[]> => {
    try {
      return await databaseHelper.getPlaylistVideos(playlistId);
    } catch (err) {
      setError(`Failed to get playlist videos: ${err}`);
      return [];
    }
  };

  const isVideoInPlaylist = async (playlistId: string, videoId: string): Promise<boolean> => {
    try {
      return await databaseHelper.isVideoInPlaylist(playlistId, videoId);
    } catch (err) {
      return false;
    }
  };

  const getVideoPlaylists = async (videoId: string): Promise<Playlist[]> => {
    try {
      return await databaseHelper.getVideoPlaylists(videoId);
    } catch (err) {
      setError(`Failed to get video playlists: ${err}`);
      return [];
    }
  };

  const value: PlaylistContextType = {
    playlists,
    isLoading,
    error,
    loadPlaylists,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getPlaylistVideos,
    isVideoInPlaylist,
    getVideoPlaylists,
  };

  return <PlaylistContext.Provider value={value}>{children}</PlaylistContext.Provider>;
};
