import * as SQLite from 'expo-sqlite';
import { Channel, ChannelInput } from '../models/Channel';
import { Video, VideoInput } from '../models/Video';
import { Playlist, PlaylistInput, PlaylistVideo, PlaylistVideoInput } from '../models/Playlist';

class DatabaseHelper {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDatabase(): Promise<void> {
    if (this.db) return;
    
    this.db = await SQLite.openDatabaseAsync('srutha.db');
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        thumbnailUrl TEXT,
        url TEXT NOT NULL,
        subscriberCount INTEGER,
        addedDate TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        channelId TEXT NOT NULL,
        channelName TEXT NOT NULL,
        description TEXT,
        thumbnailUrl TEXT,
        url TEXT NOT NULL,
        durationSeconds INTEGER,
        uploadDate TEXT,
        viewCount INTEGER,
        FOREIGN KEY (channelId) REFERENCES channels (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_videos_channelId ON videos(channelId);
      CREATE INDEX IF NOT EXISTS idx_videos_uploadDate ON videos(uploadDate DESC);

      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        createdDate TEXT NOT NULL,
        updatedDate TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS playlist_videos (
        playlistId TEXT NOT NULL,
        videoId TEXT NOT NULL,
        addedDate TEXT NOT NULL,
        position INTEGER NOT NULL,
        PRIMARY KEY (playlistId, videoId),
        FOREIGN KEY (playlistId) REFERENCES playlists (id) ON DELETE CASCADE,
        FOREIGN KEY (videoId) REFERENCES videos (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_playlist_videos_playlistId ON playlist_videos(playlistId);
      CREATE INDEX IF NOT EXISTS idx_playlist_videos_position ON playlist_videos(playlistId, position);
    `);
  }

  // Channel operations
  async insertChannel(channel: ChannelInput): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const addedDate = channel.addedDate || new Date().toISOString();
    
    await this.db.runAsync(
      `INSERT OR REPLACE INTO channels (id, name, description, thumbnailUrl, url, subscriberCount, addedDate)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      channel.id || '',
      channel.name,
      channel.description || null,
      channel.thumbnailUrl || null,
      channel.url,
      channel.subscriberCount || null,
      addedDate
    );
  }

  async getAllChannels(): Promise<Channel[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<Channel>(
      'SELECT * FROM channels ORDER BY addedDate DESC'
    );
    
    return result;
  }

  async getChannel(id: string): Promise<Channel | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<Channel>(
      'SELECT * FROM channels WHERE id = ?',
      id
    );
    
    return result || null;
  }

  async deleteChannel(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Delete videos first
    await this.db.runAsync('DELETE FROM videos WHERE channelId = ?', id);
    // Then delete channel
    await this.db.runAsync('DELETE FROM channels WHERE id = ?', id);
  }

  // Video operations
  async insertVideo(video: VideoInput): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO videos (id, title, channelId, channelName, description, thumbnailUrl, url, durationSeconds, uploadDate, viewCount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      video.id,
      video.title,
      video.channelId,
      video.channelName,
      video.description || null,
      video.thumbnailUrl || null,
      video.url,
      video.durationSeconds || null,
      video.uploadDate || null,
      video.viewCount || null
    );
  }

  async insertVideos(videos: VideoInput[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const video of videos) {
      await this.insertVideo(video);
    }
  }

  async getAllVideos(): Promise<Video[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<Video>(
      'SELECT * FROM videos ORDER BY uploadDate DESC'
    );
    
    return result;
  }

  async getChannelVideos(channelId: string): Promise<Video[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<Video>(
      'SELECT * FROM videos WHERE channelId = ? ORDER BY uploadDate DESC',
      channelId
    );
    
    return result;
  }

  async deleteVideo(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM videos WHERE id = ?', id);
  }

  async deleteChannelVideos(channelId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM videos WHERE channelId = ?', channelId);
  }

  async clearAllVideos(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM videos');
  }

  // Playlist operations
  async insertPlaylist(playlist: PlaylistInput): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = playlist.id || `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    await this.db.runAsync(
      `INSERT INTO playlists (id, name, description, createdDate, updatedDate)
       VALUES (?, ?, ?, ?, ?)`,
      id,
      playlist.name,
      playlist.description || null,
      playlist.createdDate || now,
      playlist.updatedDate || now
    );

    return id;
  }

  async updatePlaylist(id: string, playlist: Partial<PlaylistInput>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const updates: string[] = [];
    const values: any[] = [];

    if (playlist.name !== undefined) {
      updates.push('name = ?');
      values.push(playlist.name);
    }

    if (playlist.description !== undefined) {
      updates.push('description = ?');
      values.push(playlist.description);
    }

    updates.push('updatedDate = ?');
    values.push(new Date().toISOString());

    values.push(id);

    await this.db.runAsync(
      `UPDATE playlists SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    );
  }

  async getAllPlaylists(): Promise<Playlist[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<Playlist>(
      `SELECT p.*, COUNT(pv.videoId) as videoCount
       FROM playlists p
       LEFT JOIN playlist_videos pv ON p.id = pv.playlistId
       GROUP BY p.id
       ORDER BY p.updatedDate DESC`
    );
    
    return result;
  }

  async getPlaylist(id: string): Promise<Playlist | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<Playlist>(
      `SELECT p.*, COUNT(pv.videoId) as videoCount
       FROM playlists p
       LEFT JOIN playlist_videos pv ON p.id = pv.playlistId
       WHERE p.id = ?
       GROUP BY p.id`,
      id
    );
    
    return result || null;
  }

  async deletePlaylist(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM playlists WHERE id = ?', id);
  }

  async addVideoToPlaylist(input: PlaylistVideoInput): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Get the next position
    const maxPosition = await this.db.getFirstAsync<{ maxPos: number }>(
      'SELECT COALESCE(MAX(position), -1) as maxPos FROM playlist_videos WHERE playlistId = ?',
      input.playlistId
    );

    const position = input.position !== undefined ? input.position : (maxPosition?.maxPos ?? -1) + 1;
    const addedDate = input.addedDate || new Date().toISOString();

    await this.db.runAsync(
      `INSERT OR REPLACE INTO playlist_videos (playlistId, videoId, addedDate, position)
       VALUES (?, ?, ?, ?)`,
      input.playlistId,
      input.videoId,
      addedDate,
      position
    );

    // Update playlist's updatedDate
    await this.db.runAsync(
      'UPDATE playlists SET updatedDate = ? WHERE id = ?',
      new Date().toISOString(),
      input.playlistId
    );
  }

  async removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'DELETE FROM playlist_videos WHERE playlistId = ? AND videoId = ?',
      playlistId,
      videoId
    );

    // Update playlist's updatedDate
    await this.db.runAsync(
      'UPDATE playlists SET updatedDate = ? WHERE id = ?',
      new Date().toISOString(),
      playlistId
    );
  }

  async getPlaylistVideos(playlistId: string): Promise<Video[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<Video>(
      `SELECT v.* FROM videos v
       INNER JOIN playlist_videos pv ON v.id = pv.videoId
       WHERE pv.playlistId = ?
       ORDER BY pv.position ASC`,
      playlistId
    );
    
    return result;
  }

  async isVideoInPlaylist(playlistId: string, videoId: string): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM playlist_videos WHERE playlistId = ? AND videoId = ?',
      playlistId,
      videoId
    );
    
    return (result?.count ?? 0) > 0;
  }

  async getVideoPlaylists(videoId: string): Promise<Playlist[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<Playlist>(
      `SELECT p.* FROM playlists p
       INNER JOIN playlist_videos pv ON p.id = pv.playlistId
       WHERE pv.videoId = ?
       ORDER BY pv.addedDate DESC`,
      videoId
    );
    
    return result;
  }
}

export const databaseHelper = new DatabaseHelper();
