# Default Channels Feature

## Overview
The app now comes pre-loaded with 27 Buddhist/Dhamma YouTube channels on first launch.

## Implementation

### Files Added

1. **`src/data/defaultChannels.ts`**
   - Contains the list of 27 default channel handles
   - Includes popular Buddhist content creators and Dhamma channels

2. **`src/services/DefaultChannelSeeder.ts`**
   - Service that seeds default channels on first app launch
   - Runs in background without blocking UI
   - Handles errors gracefully (if one channel fails, continues with others)
   - Includes rate limiting (200ms delay between requests)
   - Tracks seeding status to avoid re-seeding on subsequent launches

### Files Modified

1. **`src/services/DatabaseHelper.ts`**
   - Added `app_settings` table to store app metadata
   - Added methods: `getSetting()`, `setSetting()`, `hasSeededDefaultChannels()`, `markDefaultChannelsSeeded()`

2. **`src/context/ChannelContext.tsx`**
   - Updated `initializeApp()` to trigger default channel seeding
   - Seeding runs asynchronously in background
   - Channels are reloaded once seeding completes

## Default Channels Included

- @adahasekathuwa
- @BuddhismInEnglish
- @BuddhismTheRoadtoNirvana
- @BuduDahama
- @budubanasrilanka
- @Dharmadeshana-new
- @DiwiMaga
- @mahamevnawa
- @PragnaTV
- @ShraddhaTV
- @shraddhatvdhammaseries
- @ShraddhaTVLive
- @ShraddhaTVNews
- @theravada2
- @Thero_Bana
- @AhasGawwa
- @යථාර්ථය (Yathartha)
- @-SasaraGanudenu
- @bomaluwatv
- @Yakkproduction
- @NirvanaTV
- @-sadahammawatha2003
- @niwanatamaga3525
- @Sldhammatv00
- @SasaraJayagamu
- @GaligamuweGnanadeepaThero
- @sathpurushaasura7641

## How It Works

1. On first app launch, after database initialization
2. Checks if default channels have been seeded (via `app_settings` table)
3. If not seeded, fetches each channel from YouTube API
4. Adds each channel to the database
5. Marks seeding as complete
6. On subsequent launches, seeding is skipped

## Developer Commands

To force re-seed channels (for testing):
```typescript
import { defaultChannelSeeder } from './src/services/DefaultChannelSeeder';
await defaultChannelSeeder.reseedDefaultChannels();
```

## Notes

- Seeding happens in background and doesn't block app startup
- If a channel fails to load, it logs a warning and continues
- Seeding is marked complete even if some channels fail (to avoid retrying infinitely)
- Users can still manually add/remove channels as before
- If user has already manually added a channel, it won't be duplicated
