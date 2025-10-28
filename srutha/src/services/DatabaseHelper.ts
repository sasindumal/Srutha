import * as SQLite from 'expo-sqlite';
import { Channel, ChannelInput } from '../models/Channel';
import { Video, VideoInput } from '../models/Video';
import { Playlist, PlaylistInput, PlaylistVideo, PlaylistVideoInput } from '../models/Playlist';

class DatabaseHelper {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDatabase(): Promise<void> {
    if (this.db) return;
    
    this.db = await SQLite.openDatabaseAsync('srutha.db');
    // Create base tables/indexes, then run migrations to keep old installs compatible
    await this.createTables();
    await this.migrateChannelsSchema();
    await this.migrateVideosSchema();
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
        addedDate TEXT NOT NULL,
        hidden INTEGER DEFAULT 0
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
        watched INTEGER DEFAULT 0,
        watchedDate TEXT,
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

  private async migrateChannelsSchema(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    const columns = await this.db.getAllAsync<any>(`PRAGMA table_info(channels)`);
    const hasHidden = columns.some((c: any) => c.name === 'hidden');
    if (!hasHidden) {
      await this.db.runAsync(`ALTER TABLE channels ADD COLUMN hidden INTEGER DEFAULT 0`);
      await this.db.execAsync(`CREATE INDEX IF NOT EXISTS idx_channels_hidden ON channels(hidden);`);
    }
  }

  // Ensure legacy databases get new columns and indexes without crashing on startup
  private async migrateVideosSchema(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Check existing columns on videos table
    const columns = await this.db.getAllAsync<any>(`PRAGMA table_info(videos)`);
    const hasWatched = columns.some((c: any) => c.name === 'watched');
    const hasWatchedDate = columns.some((c: any) => c.name === 'watchedDate');

    // Add missing columns (SQLite allows ADD COLUMN with default applied to new rows)
    if (!hasWatched) {
      await this.db.runAsync(`ALTER TABLE videos ADD COLUMN watched INTEGER DEFAULT 0`);
    }
    if (!hasWatchedDate) {
      await this.db.runAsync(`ALTER TABLE videos ADD COLUMN watchedDate TEXT`);
    }

    // Create the watched index after columns are guaranteed to exist
    await this.db.execAsync(`CREATE INDEX IF NOT EXISTS idx_videos_watched ON videos(watched);`);
  }

  // Channel operations
  async insertChannel(channel: ChannelInput): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const addedDate = channel.addedDate || new Date().toISOString();
    
    await this.db.runAsync(
      `INSERT OR REPLACE INTO channels (id, name, description, thumbnailUrl, url, subscriberCount, addedDate, hidden)
       VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, 0))`,
      channel.id || '',
      channel.name,
      channel.description || null,
      channel.thumbnailUrl || null,
      channel.url,
      channel.subscriberCount || null,
      addedDate,
      channel.hidden ? 1 : 0
    );
  }

  async getAllChannels(): Promise<Channel[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM channels ORDER BY addedDate DESC'
    );
    
    return result.map((c: any) => ({ ...c, hidden: c.hidden === 1 }));
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
      `INSERT OR REPLACE INTO videos (id, title, channelId, channelName, description, thumbnailUrl, url, durationSeconds, uploadDate, viewCount, watched, watchedDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      video.id,
      video.title,
      video.channelId,
      video.channelName,
      video.description || null,
      video.thumbnailUrl || null,
      video.url,
      video.durationSeconds || null,
      video.uploadDate || null,
      video.viewCount || null,
      video.watched ? 1 : 0,
      video.watchedDate || null
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

    const result = await this.db.getAllAsync<any>(
      `SELECT v.* FROM videos v
       INNER JOIN channels c ON c.id = v.channelId
       WHERE COALESCE(c.hidden, 0) = 0
       ORDER BY v.uploadDate DESC`
    );
    
    return result.map((video: any) => ({
      ...video,
      watched: video.watched === 1,
    }));
  }

  async getChannelVideos(channelId: string): Promise<Video[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM videos WHERE channelId = ? ORDER BY uploadDate DESC',
      channelId
    );
    
    return result.map((video: any) => ({
      ...video,
      watched: video.watched === 1,
    }));
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

  async markVideoAsWatched(videoId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE videos SET watched = 1, watchedDate = ? WHERE id = ?',
      new Date().toISOString(),
      videoId
    );
  }

  async markVideoAsUnwatched(videoId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE videos SET watched = 0, watchedDate = NULL WHERE id = ?',
      videoId
    );
  }

  async getWatchedVideos(): Promise<Video[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM videos WHERE watched = 1 ORDER BY watchedDate DESC'
    );
    
    return result.map((video: any) => ({
      ...video,
      watched: video.watched === 1,
    }));
  }

  async getUnwatchedVideos(): Promise<Video[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync<any>(
      `SELECT v.* FROM videos v
       INNER JOIN channels c ON c.id = v.channelId
       WHERE (v.watched = 0 OR v.watched IS NULL)
         AND COALESCE(c.hidden, 0) = 0
       ORDER BY v.uploadDate DESC`
    );
    
    return result.map((video: any) => ({
      ...video,
      watched: video.watched === 1,
    }));
  }

  async hideChannel(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('UPDATE channels SET hidden = 1 WHERE id = ?', id);
  }

  async unhideChannel(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('UPDATE channels SET hidden = 0 WHERE id = ?', id);
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

    const result = await this.db.getAllAsync<any>(
      `SELECT v.* FROM videos v
       INNER JOIN playlist_videos pv ON v.id = pv.videoId
       WHERE pv.playlistId = ?
       ORDER BY pv.position ASC`,
      playlistId
    );
    
    return result.map((video: any) => ({
      ...video,
      watched: video.watched === 1,
    }));
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
