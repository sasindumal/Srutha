# Video Playback & Features

## ✅ Implemented Features

### 1. **YouTube Video Playback** ▶️
- Integrated `react-native-youtube-iframe` for native YouTube player
- Videos play directly in the app without leaving
- Full playback controls (play, pause, seek, fullscreen)
- Automatic video ID extraction from URLs
- Fallback to "Open in YouTube" for invalid video IDs

### 2. **Like Functionality** 👍
- Tapping "Like" opens an alert dialog
- Provides option to open video in YouTube app/browser
- Users can like the video on YouTube (requires YouTube account)
- Note: Direct liking requires YouTube API OAuth which needs user authentication

### 3. **Share Functionality** 🔗
- Native share dialog on mobile (iOS/Android)
- Shares video title and URL
- Works with all installed apps (WhatsApp, Messages, Email, etc.)
- Web platform support with fallback
- Uses `expo-sharing` and React Native's Share API

### 4. **Download Information** 💾
- Shows informational dialog about YouTube video downloads
- Explains that direct download violates YouTube's Terms of Service
- Suggests legitimate alternatives:
  - YouTube Premium offline feature
  - Authorized third-party services
  - Only download videos you have rights to
- Provides "Open in YouTube" option

## 📦 Dependencies Added

```json
{
  "react-native-youtube-iframe": "latest",
  "expo-sharing": "~13.0.0",
  "react-native-webview": "~13.15.0"
}
```

## 🎮 How to Use

### Playing Videos
1. Navigate to any channel's video list
2. Tap on a video card
3. Video player screen opens with YouTube iframe
4. Tap play to start watching
5. Use standard YouTube controls (play/pause, seek, fullscreen)

### Liking Videos
1. While watching a video, tap the "Like" button
2. Choose "Open YouTube" in the dialog
3. Like the video on YouTube's platform

### Sharing Videos
1. Tap the "Share" button while watching
2. Native share sheet appears
3. Choose your preferred app to share with
4. Video title and URL are shared

### Download Info
1. Tap the "Download" button
2. Read the information about legitimate download options
3. Use YouTube Premium or authorized services

## 🔒 YouTube API Integration

The app uses YouTube Data API v3 for:
- Channel information and metadata
- Video lists and details
- Thumbnail URLs
- View counts and statistics

**API Key Required**: Set your `YOUTUBE_API_KEY` in `src/config.ts`

## ⚠️ Important Notes

### Terms of Service
- **Video downloads**: Direct programmatic downloads violate YouTube's ToS
- **Playback**: Embedded player complies with YouTube's iframe API terms
- **Sharing**: Native sharing is fully compliant
- **Liking**: Requires user interaction on YouTube's platform

### Privacy
- No video data is stored locally (only metadata)
- Playback happens through YouTube's official iframe
- No tracking beyond what YouTube's player provides

### Performance
- Videos stream directly from YouTube
- No bandwidth overhead on your servers
- Requires active internet connection
- Player respects YouTube's content restrictions (age-gated, region-locked, etc.)

## 🚀 Future Enhancements

Potential features for future versions:
- [ ] Add to watchlist/favorites
- [ ] Playback history tracking
- [ ] Picture-in-Picture mode
- [ ] Background audio playback
- [ ] Playlist support
- [ ] Comments integration (requires OAuth)
- [ ] Full OAuth implementation for likes/subscriptions

## 🐛 Troubleshooting

### Video Won't Play
- Check internet connection
- Verify video isn't age-restricted or region-locked
- Try "Open in YouTube" as fallback
- Ensure YouTube API key is valid

### Share Not Working
- Verify app has necessary permissions
- Check if device has sharing-capable apps installed
- Try updating Expo Go or building standalone app

### Player Shows Black Screen
- Check if `react-native-webview` is properly installed
- Verify YouTube iframe API isn't blocked by network
- Clear app cache and restart

## 📚 Technical Details

### Video ID Extraction
```typescript
const getVideoId = (url: string): string => {
  const match = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|$)/);
  return match ? match[1] : '';
};
```

Supports formats:
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

### Player Component
```tsx
<YoutubePlayer
  height={(SCREEN_WIDTH * 9) / 16}
  play={isPlaying}
  videoId={videoId}
  onChangeState={onStateChange}
/>
```

### Share Implementation
```typescript
await Share.share({
  message: `${video.title}\n${video.url}`,
  url: video.url,
  title: video.title,
});
```

## 📄 License Compliance

This implementation complies with:
- ✅ YouTube's Terms of Service
- ✅ YouTube API Terms of Service
- ✅ React Native YouTube iframe library license
- ✅ Expo licensing terms

---

**Last Updated**: October 28, 2025
**Expo SDK**: 54.0.0
**React Native**: 0.81.5
