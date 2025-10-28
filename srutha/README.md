# Srutha - React Native Expo

A YouTube channel subscription manager built with React Native and Expo. Watch videos from your favorite channels with a clean, Material Design interface.

> **Note**: This project has been transformed from Flutter to React Native Expo while maintaining the same UI/UX and features.

## 🎯 Features

- 📺 Add YouTube channels by URL or handle
- 🗑️ Remove channels with swipe-to-delete or delete button
- 🎬 Browse videos from all your subscribed channels
- 🔍 **Search videos** by title, channel name, or description
- 🔄 **Infinite scroll** - loads more videos as you scroll
- 🎚️ **Filter videos** by:
  - Channel (select specific channels)
  - Upload time (today, week, month, year, all time)
  - Sort order (latest, oldest, most views)
- ▶️ Watch videos with integrated YouTube player (react-native-youtube-iframe)
- 📋 Create and manage playlists
- ➕ Add videos to playlists
- ✏️ Edit playlist name and description
- 🗑️ Delete playlists and remove videos from playlists
- 💾 Download videos for offline viewing
- 🔗 Share videos with friends
- 💾 Local SQLite database for offline channel management
- 🌙 Dark mode support
- 📱 Cross-platform (iOS, Android, Web)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Configure your YouTube API key (edit src/config.ts)
# Then start the app
npm start
```

## 📋 Setup Requirements

1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **YouTube Data API Key** - [Get it here](https://console.cloud.google.com/)
3. **Expo Go app** (optional) - For testing on physical device

## 💻 Tech Stack

- **React Native** with **Expo SDK 54**
- **TypeScript** for type safety
- **React Navigation** for screen navigation
- **React Native Paper** for Material Design components
- **Expo SQLite** for local database
- **react-native-youtube-iframe** for video playback
- **Expo Sharing** for native sharing functionality
- **Context API** for state management

## 📁 Project Structure

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

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure YouTube API

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **YouTube Data API v3**
4. Create credentials (API Key)
5. Open `src/config.ts` and set `YOUTUBE_API_KEY`

### 3. Update YouTube Service

Already wired: `src/services/YouTubeService.ts` uses the API to fetch channels and latest videos. Just ensure your API key is set in `src/config.ts`.

### 4. Run the App

```bash
# Start development server
npm start

# Run on specific platform
npm run ios        # iOS (Mac only)
npm run android    # Android
npm run web        # Web browser
```

## 📱 Running on Device

### Using Expo Go

1. Install Expo Go from App Store / Play Store
2. Run `npm start`
3. Scan the QR code with your device

### Using Emulator

**iOS Simulator** (Mac only):
```bash
npm run ios
```

**Android Emulator**:
```bash
npm run android
```

## 🏗️ Building for Production

### Using EAS Build (Recommended)

```bash
npm install -g eas-cli
eas login
eas build --platform all
```

### Traditional Expo Build

```bash
expo build:ios
expo build:android
```

## 📚 Documentation

- [**TRANSFORMATION_COMPLETE.md**](./TRANSFORMATION_COMPLETE.md) - Complete transformation overview
- [**SETUP_REACT_NATIVE.md**](./SETUP_REACT_NATIVE.md) - Detailed setup guide
- [**MIGRATION_GUIDE.md**](./MIGRATION_GUIDE.md) - Flutter to React Native comparison
- [**CHECKLIST.md**](./CHECKLIST.md) - Step-by-step setup checklist

## ⚠️ Important Notes

### YouTube API Integration

The YouTube service requires proper API integration:

1. Get a YouTube Data API v3 key
2. Update `src/services/YouTubeService.ts` with actual API calls
3. Current implementation includes placeholder code

### Video Playback

For full YouTube video playback, consider:

- **Option 1**: Use `react-native-youtube-iframe`
- **Option 2**: Create a backend proxy with `ytdl-core`
- **Option 3**: Open videos in YouTube app (current implementation)

## 🐛 Troubleshooting

### Module not found
```bash
npm install
```

### Metro bundler issues
```bash
npm start -- --clear
```

### TypeScript errors
```bash
npm run type-check
```

## 📝 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## 🎨 Customization

### Change Theme

Edit `src/theme/theme.ts`:

```typescript
const lightTheme = {
  colors: {
    primary: '#your-color',
    // ... other colors
  },
};
```

### Add New Screen

1. Create component in `src/screens/`
2. Add route to `src/navigation/AppNavigator.tsx`
3. Update navigation types

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Transformed from Flutter to React Native Expo
- Same database schema and user experience maintained
- UI design inspired by Material Design 3

## 📞 Support

For issues or questions:
- Check the [documentation files](./TRANSFORMATION_COMPLETE.md)
- Open an issue on GitHub
- Review the [checklist](./CHECKLIST.md)

---

**Built with ❤️ using React Native and Expo**

*Note: This application uses YouTube services and must comply with [YouTube's Terms of Service](https://www.youtube.com/t/terms).*
