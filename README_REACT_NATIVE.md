# Srutha - React Native Expo

A YouTube channel subscription manager built with React Native and Expo. Watch videos from your favorite channels with a clean, Material Design interface.

## Features

- 📺 Add YouTube channels by URL or handle
- 🎬 Browse videos from all your subscribed channels
- ▶️ Watch videos with integrated player
- 💾 Local SQLite database for offline channel management
- 🌙 Dark mode support
- 📱 Cross-platform (iOS, Android, Web)

## Tech Stack

- **React Native** with **Expo SDK 51**
- **TypeScript** for type safety
- **React Navigation** for screen navigation
- **React Native Paper** for Material Design components
- **Expo SQLite** for local database
- **Expo AV** for video playback
- **Context API** for state management

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── VideoCard.tsx
│   └── ChannelCard.tsx
├── context/            # React Context providers
│   └── ChannelContext.tsx
├── models/             # TypeScript interfaces
│   ├── Channel.ts
│   └── Video.ts
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── screens/            # Screen components
│   ├── HomeScreen.tsx
│   ├── ChannelsScreen.tsx
│   ├── AddChannelScreen.tsx
│   ├── VideoPlayerScreen.tsx
│   └── ChannelVideosScreen.tsx
├── services/           # Business logic & API calls
│   ├── DatabaseHelper.ts
│   └── YouTubeService.ts
└── theme/              # App theming
    └── theme.ts
```

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Run on specific platform:**
   ```bash
   # iOS (Mac only)
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

## Important Notes

### YouTube API Integration

This project requires YouTube Data API integration for full functionality:

1. **Get YouTube Data API Key:**
   - Visit [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable YouTube Data API v3
   - Create credentials (API Key)

2. **Configure API Key:**
   - Create a `.env` file in the project root
   - Add: `YOUTUBE_API_KEY=your_api_key_here`

3. **Update YouTubeService.ts:**
   - Uncomment API call implementations
   - Replace `YOUR_API_KEY` with your actual key

### Video Playback

The current implementation includes a placeholder video player. For full YouTube video playback:

**Option 1: Use YouTube Iframe**
```bash
npm install react-native-youtube-iframe
```

**Option 2: Backend Proxy**
- Create a backend service to extract video streams
- Use libraries like `ytdl-core` on the server

**Option 3: Direct Links**
- Open videos in external YouTube app (current implementation)

## Differences from Flutter Version

- **State Management:** Context API instead of Provider package
- **Database:** Expo SQLite instead of sqflite
- **Video Player:** Expo AV instead of video_player/chewie
- **Navigation:** React Navigation instead of Navigator
- **UI Components:** React Native Paper instead of Material widgets
- **API Integration:** Requires manual YouTube Data API setup

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Development

### Adding New Features

1. **New Screen:**
   - Create screen component in `src/screens/`
   - Add to `AppNavigator.tsx`
   - Update navigation types

2. **New Database Table:**
   - Update `DatabaseHelper.ts`
   - Add migration logic
   - Update relevant models

3. **New API Endpoint:**
   - Add method to `YouTubeService.ts`
   - Update Context provider
   - Handle loading/error states

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform all
```

## Known Issues

- YouTube video stream extraction requires additional implementation
- API rate limits may affect channel/video fetching
- iOS requires physical device or simulator setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Migration from Flutter

This is a complete React Native Expo port of the original Flutter application. Key architectural decisions:

- **Maintained:** Same database schema, app structure, and user experience
- **Enhanced:** Better TypeScript types, modern React patterns
- **Simplified:** Removed platform-specific code where possible

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Note:** This application uses YouTube services and must comply with [YouTube's Terms of Service](https://www.youtube.com/t/terms).
