import axios from 'axios';
import { ChannelInput } from '../models/Channel';
import { VideoInput } from '../models/Video';
import { YOUTUBE_API_KEY } from '../config';

// Note: This is a simplified implementation. For production, you would need:
// 1. YouTube Data API key
// 2. Or use a backend proxy service
// 3. Or use libraries like react-native-youtube-iframe with custom scraping

class YouTubeService {
  private readonly API_BASE = 'https://www.youtube.com';
  private readonly GOOGLE_API_BASE = 'https://www.googleapis.com/youtube/v3';
  
  /**
   * Extract channel ID from various YouTube URL formats
   */
  extractChannelId(input: string): string | null {
    try {
      // If it's already a channel ID
      if (input.startsWith('UC') && input.length === 24) {
        return input;
      }

      // Try to extract from URL
      const patterns = [
        /youtube\.com\/channel\/(UC[\w-]+)/,
        /youtube\.com\/@([\w\-.]+)/,
        /youtube\.com\/c\/([\w\-.]+)/,
        /youtube\.com\/user\/([\w\-.]+)/,
      ];

      for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match) {
          return match[1];
        }
      }

      // If no pattern matches, return as is (might be username or handle)
      return input;
    } catch (e) {
      return null;
    }
  }

  /**
   * Get channel information using YouTube Data API v3
   */
  async getChannelInfo(channelInput: string): Promise<ChannelInput> {
    try {
      const extracted = this.extractChannelId(channelInput.trim());

      // If we already have a channel ID, fetch details directly
      if (extracted && extracted.startsWith('UC')) {
        return await this.fetchChannelById(extracted);
      }

      // Otherwise, search for the channel by handle/username/query
      const query = (extracted || channelInput).replace(/^@/, '');
      const searchResp = await axios.get(`${this.GOOGLE_API_BASE}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'channel',
          maxResults: 1,
          key: YOUTUBE_API_KEY,
        },
      });

      if (!searchResp.data.items || searchResp.data.items.length === 0) {
        throw new Error('No channel found for the given input');
      }

      const channelId: string | undefined = searchResp.data.items[0]?.id?.channelId;
      if (!channelId) {
        throw new Error('Failed to resolve channel ID');
      }

      return await this.fetchChannelById(channelId);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.message || String(error);
      throw new Error(`Failed to fetch channel info: ${message}`);
    }
  }

  private async fetchChannelById(channelId: string): Promise<ChannelInput> {
    const resp = await axios.get(`${this.GOOGLE_API_BASE}/channels`, {
      params: {
        part: 'snippet,statistics',
        id: channelId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (!resp.data.items || resp.data.items.length === 0) {
      throw new Error('Channel not found');
    }

    const item = resp.data.items[0];
    const snippet = item.snippet;
    const stats = item.statistics || {};

    const channel: ChannelInput = {
      id: item.id,
      name: snippet.title,
      description: snippet.description,
      thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
      url: `https://youtube.com/channel/${item.id}`,
      subscriberCount: stats.hiddenSubscriberCount ? undefined : Number(stats.subscriberCount || 0),
      addedDate: new Date().toISOString(),
    };

    return channel;
  }

  /**
   * Get videos from a channel (latest by date)
   */
  async getChannelVideos(channelId: string, limit: number = 30): Promise<VideoInput[]> {
    try {
      const max = Math.min(Math.max(limit, 1), 50); // YouTube API caps at 50 per request

      // First, search for latest videos in the channel
      const searchResp = await axios.get(`${this.GOOGLE_API_BASE}/search`, {
        params: {
          part: 'snippet',
          channelId,
          maxResults: max,
          order: 'date',
          type: 'video',
          key: YOUTUBE_API_KEY,
        },
      });

      const items: any[] = searchResp.data.items || [];
      if (items.length === 0) return [];

      const baseVideos: VideoInput[] = items.map((it) => {
        const vid = it.id?.videoId;
        const sn = it.snippet;
        return {
          id: vid,
          title: sn.title,
          channelId: sn.channelId,
          channelName: sn.channelTitle,
          description: sn.description,
          thumbnailUrl: sn.thumbnails?.high?.url || sn.thumbnails?.default?.url,
          url: `https://www.youtube.com/watch?v=${vid}`,
          uploadDate: sn.publishedAt,
        } as VideoInput;
      });

      // Enrich with durations and views
      const ids = baseVideos.map((v) => v.id).filter(Boolean);
      if (ids.length > 0) {
        const videosResp = await axios.get(`${this.GOOGLE_API_BASE}/videos`, {
          params: {
            part: 'contentDetails,statistics',
            id: ids.join(','),
            key: YOUTUBE_API_KEY,
          },
        });

        const detailsMap = new Map<string, any>();
        for (const it of videosResp.data.items || []) {
          detailsMap.set(it.id, it);
        }

        for (const v of baseVideos) {
          const d = detailsMap.get(v.id);
          if (d) {
            v.durationSeconds = this.parseISODuration(d.contentDetails?.duration);
            const views = d.statistics?.viewCount;
            v.viewCount = typeof views === 'string' ? Number(views) : views;
          }
        }
      }

      return baseVideos;
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.message || String(error);
      throw new Error(`Failed to fetch channel videos: ${message}`);
    }
  }

  /**
   * Search for channels
   */
  async searchChannels(query: string): Promise<ChannelInput[]> {
    try {
      const resp = await axios.get(`${this.GOOGLE_API_BASE}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'channel',
          maxResults: 10,
          key: YOUTUBE_API_KEY,
        },
      });

      const items: any[] = resp.data.items || [];
      if (items.length === 0) return [];

      // For each channel found, map basic info
      return items.map((it) => {
        const sn = it.snippet;
        const id = it.id?.channelId;
        return {
          id,
          name: sn.channelTitle,
          description: sn.description,
          thumbnailUrl: sn.thumbnails?.high?.url || sn.thumbnails?.default?.url,
          url: `https://youtube.com/channel/${id}`,
          addedDate: new Date().toISOString(),
        } as ChannelInput;
      });
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.message || String(error);
      throw new Error(`Failed to search channels: ${message}`);
    }
  }

  /**
   * Get video stream URL
   * Note: This requires additional libraries or backend service
   */
  async getVideoStreamUrl(videoId: string): Promise<string> {
    try {
      // This would typically require:
      // 1. A backend service to extract stream URLs
      // 2. Or use react-native-youtube-iframe which handles playback
      // 3. Or implement custom extraction (complex and may break)
      
      // For now, return the YouTube URL
      return `https://www.youtube.com/watch?v=${videoId}`;
    } catch (error) {
      throw new Error(`Failed to get video stream URL: ${error}`);
    }
  }

  /**
   * Get detailed video information by video ID
   */
  async getVideoDetails(videoId: string): Promise<VideoInput> {
    try {
      const resp = await axios.get(`${this.GOOGLE_API_BASE}/videos`, {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: videoId,
          key: YOUTUBE_API_KEY,
        },
      });

      if (!resp.data.items || resp.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const item = resp.data.items[0];
      const snippet = item.snippet;
      const stats = item.statistics || {};
      const details = item.contentDetails || {};

      return {
        id: item.id,
        title: snippet.title,
        channelId: snippet.channelId,
        channelName: snippet.channelTitle,
        description: snippet.description,
        thumbnailUrl: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
        url: `https://www.youtube.com/watch?v=${item.id}`,
        uploadDate: snippet.publishedAt,
        durationSeconds: this.parseISODuration(details.duration),
        viewCount: stats.viewCount ? Number(stats.viewCount) : undefined,
      };
    } catch (error: any) {
      const message = error?.response?.data?.error?.message || error?.message || String(error);
      throw new Error(`Failed to fetch video details: ${message}`);
    }
  }

  private parseISODuration(duration?: string): number | undefined {
    if (!duration) return undefined;
    // Example: PT1H2M10S, PT15M, PT45S
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const m = duration.match(regex);
    if (!m) return undefined;
    const hours = m[1] ? parseInt(m[1], 10) : 0;
    const minutes = m[2] ? parseInt(m[2], 10) : 0;
    const seconds = m[3] ? parseInt(m[3], 10) : 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
}

export const youtubeService = new YouTubeService();
