import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

export interface DownloadProgress {
  totalBytes: number;
  bytesWritten: number;
  progress: number;
}

export interface VideoFormat {
  quality: string;
  format: string;
  url: string;
  hasAudio: boolean;
  hasVideo: boolean;
  filesize?: number;
}

class VideoDownloadService {
  private downloads: Map<string, AbortController> = new Map();
  private progressCallbacks: Map<string, (progress: DownloadProgress) => void> = new Map();

  /**
   * Get available video formats for a YouTube video
   * Note: This requires a backend service or YouTube Data API
   * For now, we'll use a simplified approach
   */
  async getVideoFormats(videoId: string): Promise<VideoFormat[]> {
    try {
      // In a real implementation, you would:
      // 1. Use a backend API that extracts YouTube video URLs (like NewPipe extractor)
      // 2. Use youtube-dl backend service
      // 3. Use a third-party API
      
      // For now, return sample formats
      // You need to implement a backend service to extract real URLs
      return [
        {
          quality: '720p',
          format: 'mp4',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          hasAudio: true,
          hasVideo: true,
        },
        {
          quality: '480p',
          format: 'mp4',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          hasAudio: true,
          hasVideo: true,
        },
        {
          quality: '360p',
          format: 'mp4',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          hasAudio: true,
          hasVideo: true,
        },
      ];
    } catch (error) {
      throw new Error(`Failed to get video formats: ${error}`);
    }
  }

  /**
   * Download a video from URL to device storage
   */
  async downloadVideo(
    videoId: string,
    videoTitle: string,
    downloadUrl: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Storage permission not granted');
      }

      // Sanitize filename
      const sanitizedTitle = this.sanitizeFilename(videoTitle);
      const filename = `${sanitizedTitle}_${videoId}.mp4`;
      
      // Create file in document directory
      const file = new File(Paths.document, filename);

      // Store progress callback
      if (onProgress) {
        this.progressCallbacks.set(videoId, onProgress);
      }

      // Create abort controller for cancellation
      const abortController = new AbortController();
      this.downloads.set(videoId, abortController);

      // Download the video
      const response = await fetch(downloadUrl, {
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const totalBytes = parseInt(response.headers.get('content-length') || '0', 10);
      let bytesWritten = 0;

      // Read the response stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response stream');
      }

      // Write to file
      const chunks: Uint8Array[] = [];
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        if (value) {
          chunks.push(value);
          bytesWritten += value.length;
          
          // Report progress
          const callback = this.progressCallbacks.get(videoId);
          if (callback && totalBytes > 0) {
            callback({
              totalBytes,
              bytesWritten,
              progress: bytesWritten / totalBytes,
            });
          }
        }
      }

      // Combine chunks and write to file
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const combinedArray = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        combinedArray.set(chunk, offset);
        offset += chunk.length;
      }

      // Write the file
      await file.write(combinedArray);

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(file.uri);
      await MediaLibrary.createAlbumAsync('Srutha Downloads', asset, false);

      // Cleanup
      this.downloads.delete(videoId);
      this.progressCallbacks.delete(videoId);

      return file.uri;
    } catch (error: any) {
      this.downloads.delete(videoId);
      this.progressCallbacks.delete(videoId);
      
      if (error.name === 'AbortError') {
        throw new Error('Download cancelled');
      }
      
      throw new Error(`Failed to download video: ${error.message || error}`);
    }
  }

  /**
   * Download video using a backend extractor service
   * This is the recommended approach similar to NewPipe
   */
  async downloadVideoWithExtractor(
    videoId: string,
    videoTitle: string,
    quality: string = '720p',
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<string> {
    try {
      // Step 1: Get download URL from backend extractor
      // You need to set up a backend service that uses youtube-dl or similar
      const extractorUrl = await this.getDownloadUrlFromBackend(videoId, quality);
      
      // Step 2: Download the video
      return await this.downloadVideo(videoId, videoTitle, extractorUrl, onProgress);
    } catch (error) {
      throw new Error(`Failed to download video: ${error}`);
    }
  }

  /**
   * Get download URL from a backend extractor service
   * You need to implement this backend service
   */
  private async getDownloadUrlFromBackend(
    videoId: string,
    quality: string
  ): Promise<string> {
    try {
      // Example: Call your backend API
      // const response = await fetch(`https://your-backend.com/api/extract`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ videoId, quality }),
      // });
      // const data = await response.json();
      // return data.downloadUrl;

      // For now, throw an error indicating backend is needed
      throw new Error(
        'Backend extractor service not configured. ' +
        'You need to set up a backend API that uses youtube-dl or NewPipe Extractor. ' +
        'See: https://github.com/TeamNewPipe/NewPipeExtractor'
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Pause a download
   */
  async pauseDownload(videoId: string): Promise<void> {
    // Not directly supported with fetch API
    // Would need to implement custom pause/resume logic
    console.warn('Pause not supported in current implementation');
  }

  /**
   * Resume a download
   */
  async resumeDownload(videoId: string): Promise<void> {
    // Not directly supported with fetch API
    // Would need to implement custom pause/resume logic
    console.warn('Resume not supported in current implementation');
  }

  /**
   * Cancel a download
   */
  async cancelDownload(videoId: string): Promise<void> {
    const abortController = this.downloads.get(videoId);
    if (abortController) {
      abortController.abort();
      this.downloads.delete(videoId);
      this.progressCallbacks.delete(videoId);
    }
  }

  /**
   * Check if a video is currently downloading
   */
  isDownloading(videoId: string): boolean {
    return this.downloads.has(videoId);
  }

  /**
   * Get list of downloaded videos
   */
  async getDownloadedVideos(): Promise<MediaLibrary.Asset[]> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        return [];
      }

      const album = await MediaLibrary.getAlbumAsync('Srutha Downloads');
      if (!album) {
        return [];
      }

      const media = await MediaLibrary.getAssetsAsync({
        album: album,
        mediaType: 'video',
        sortBy: 'creationTime',
      });

      return media.assets;
    } catch (error) {
      console.error('Failed to get downloaded videos:', error);
      return [];
    }
  }

  /**
   * Delete a downloaded video
   */
  async deleteDownloadedVideo(assetId: string): Promise<boolean> {
    try {
      return await MediaLibrary.deleteAssetsAsync([assetId]);
    } catch (error) {
      console.error('Failed to delete video:', error);
      return false;
    }
  }

  /**
   * Sanitize filename to remove invalid characters
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .substring(0, 100);
  }

  /**
   * Format bytes to human readable size
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get download progress percentage
   */
  getProgressPercentage(progress: DownloadProgress): string {
    return `${Math.round(progress.progress * 100)}%`;
  }
}

export const videoDownloadService = new VideoDownloadService();
