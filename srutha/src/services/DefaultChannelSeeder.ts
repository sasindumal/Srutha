import { databaseHelper } from './DatabaseHelper';
import { youtubeService } from './YouTubeService';
import { DEFAULT_CHANNELS } from '../data/defaultChannels';

/**
 * Service to seed default Buddhist/Dhamma channels on first app launch
 */
class DefaultChannelSeeder {
  /**
   * Seeds default channels if they haven't been seeded yet
   * Runs silently in background without blocking UI
   */
  async seedDefaultChannelsIfNeeded(): Promise<void> {
    try {
      // Check if already seeded
      const hasSeeded = await databaseHelper.hasSeededDefaultChannels();
      if (hasSeeded) {
        console.log('Default channels already seeded');
        return;
      }

      console.log(`Seeding ${DEFAULT_CHANNELS.length} default channels...`);
      
      // Seed channels one by one (with error handling per channel)
      let successCount = 0;
      let failCount = 0;

      for (const channelHandle of DEFAULT_CHANNELS) {
        try {
          // Get channel info from YouTube
          const channelInfo = await youtubeService.getChannelInfo(channelHandle);
          
          // Check if already exists (in case user manually added it)
          if (channelInfo.id) {
            const existing = await databaseHelper.getChannel(channelInfo.id);
            if (existing) {
              console.log(`Channel ${channelHandle} already exists, skipping`);
              successCount++;
              continue;
            }
          }

          // Add to database
          await databaseHelper.insertChannel(channelInfo);
          console.log(`✓ Seeded channel: ${channelHandle}`);
          successCount++;

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.warn(`✗ Failed to seed channel ${channelHandle}:`, error);
          failCount++;
          // Continue with next channel even if one fails
        }
      }

      // Mark as seeded even if some failed (don't retry on every launch)
      await databaseHelper.markDefaultChannelsSeeded();
      
      console.log(`Default channels seeding complete: ${successCount} success, ${failCount} failed`);
    } catch (error) {
      console.error('Error during default channel seeding:', error);
      // Don't throw - allow app to continue even if seeding fails
    }
  }

  /**
   * Force re-seed all default channels (useful for testing or updates)
   */
  async reseedDefaultChannels(): Promise<void> {
    await databaseHelper.setSetting('default_channels_seeded', 'false');
    await this.seedDefaultChannelsIfNeeded();
  }
}

export const defaultChannelSeeder = new DefaultChannelSeeder();
