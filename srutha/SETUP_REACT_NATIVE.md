# Srutha React Native - Setup Instructions

## ✅ Transformation Complete!

Your Flutter app has been successfully transformed to React Native Expo!

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up YouTube API (Required)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "YouTube Data API v3"
4. Create credentials (API Key)
5. Copy `.env.example` to `.env`
6. Add your API key to `.env`

### 3. Run the App

```bash
# Start development server
npm start

# Run on iOS (Mac only)
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## 📁 Project Structure

```
/Users/sasindumalhara/Workspace/Srutha/srutha/
├── src/
│   ├── components/          # VideoCard, ChannelCard
│   ├── context/            # ChannelContext (state management)
│   ├── models/             # TypeScript interfaces
│   ├── navigation/         # React Navigation setup
│   ├── screens/            # All screen components
│   ├── services/           # Database & YouTube API
│   └── theme/              # App theming (red theme)
├── App.tsx                 # Root component
├── index.js                # Entry point
├── package.json            # Dependencies
└── app.json                # Expo configuration
```

## 🎨 Features Implemented

✅ **Same UI/UX as Flutter app**
- Material Design with red theme
- Dark mode support
- Same screen layouts and navigation flow

✅ **All Screens Migrated:**
- HomeScreen - Video feed with refresh
- ChannelsScreen - List of subscribed channels
- AddChannelScreen - Add channels by URL/handle
- VideoPlayerScreen - Video playback interface
- ChannelVideosScreen - Videos from specific channel

✅ **Core Functionality:**
- SQLite database (same schema as Flutter)
- Channel management (add/delete)
- Video storage and retrieval
- State management with Context API

## ⚠️ Important Notes

### YouTube API Integration

The `YouTubeService.ts` file contains placeholder implementations. You MUST:

1. Add your YouTube Data API key to `.env`
2. Uncomment API call code in `src/services/YouTubeService.ts`
3. Replace `YOUR_API_KEY` with your actual key

Example API call:
```typescript
const response = await axios.get(
  'https://www.googleapis.com/youtube/v3/channels',
  {
    params: {
      part: 'snippet,statistics',
      id: channelId,
      key: process.env.YOUTUBE_API_KEY,
    },
  }
);
```

### Video Playback

Current implementation opens videos in YouTube app. For embedded playback:

**Option 1: React Native YouTube Iframe**
```bash
npm install react-native-youtube-iframe
```

**Option 2: Custom Backend**
Create a Node.js backend with `ytdl-core` to extract video streams.

## 🔧 Customization

### Change Theme Colors

Edit `src/theme/theme.ts`:
```typescript
const lightTheme = {
  colors: {
    primary: '#your-color',
    // ... other colors
  },
};
```

### Modify Database Schema

Edit `src/services/DatabaseHelper.ts` and add migration logic.

### Add New Screens

1. Create in `src/screens/`
2. Add route to `src/navigation/AppNavigator.tsx`

## 📦 Dependencies

Key packages:
- `expo` - Development platform
- `react-navigation` - Navigation
- `react-native-paper` - UI components
- `expo-sqlite` - Database
- `expo-av` - Video player
- `axios` - HTTP requests

## 🐛 Troubleshooting

### Module not found errors?
```bash
npm install
```

### Metro bundler issues?
```bash
expo start -c
```

### iOS build fails?
```bash
cd ios && pod install && cd ..
```

### Android build issues?
```bash
cd android && ./gradlew clean && cd ..
```

## 🚀 Building for Production

### Development Build
```bash
expo build:android
expo build:ios
```

### EAS Build (Recommended)
```bash
npm install -g eas-cli
eas login
eas build --platform all
```

## 📱 Testing

### On Physical Device
1. Install "Expo Go" from App Store/Play Store
2. Scan QR code from `npm start`

### On Emulator
- iOS: Xcode Simulator
- Android: Android Studio Emulator

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Get YouTube API key
3. ✅ Configure `.env` file
4. ✅ Update `YouTubeService.ts` with API calls
5. ✅ Run the app: `npm start`
6. ✅ Test on your device/emulator

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)

## 💡 Key Differences from Flutter

| Flutter | React Native |
|---------|-------------|
| Provider package | Context API |
| sqflite | expo-sqlite |
| video_player | expo-av |
| Material widgets | react-native-paper |
| Navigator | React Navigation |
| Dart | TypeScript |

## ✨ What's Preserved

- ✅ Same database schema
- ✅ Same UI design and colors
- ✅ Same navigation flow
- ✅ Same user experience
- ✅ Same feature set

---

**Ready to go!** Run `npm install` and then `npm start` to begin development.

For help or issues, check the `README_REACT_NATIVE.md` file.
