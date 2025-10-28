# ✅ React Native Expo Setup Checklist

Use this checklist to ensure your React Native Expo app is properly set up.

## Prerequisites

- [ ] Node.js 18+ installed (`node -v` to check)
- [ ] npm or yarn installed (`npm -v` to check)
- [ ] Code editor (VS Code recommended)
- [ ] iOS Simulator (Mac only) or Android Studio (for emulators)
- [ ] Expo Go app on your phone (optional, for quick testing)

## Installation Steps

### 1. Initial Setup
- [ ] Navigate to project directory: `cd /Users/sasindumalhara/Workspace/Srutha/srutha`
- [ ] Run setup script: `./setup.sh` (or manually: `npm install`)
- [ ] Verify all dependencies installed successfully

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env`: `cp .env.example .env`
- [ ] Get YouTube Data API key from [Google Cloud Console](https://console.cloud.google.com/)
  - [ ] Create or select a project
  - [ ] Enable "YouTube Data API v3"
  - [ ] Create API key (API Keys under Credentials)
- [ ] Add API key to `.env` file: `YOUTUBE_API_KEY=your_key_here`

### 3. Update YouTube Service
- [ ] Open `src/services/YouTubeService.ts`
- [ ] Uncomment API call implementations
- [ ] Replace placeholder `YOUR_API_KEY` with `process.env.YOUTUBE_API_KEY`
- [ ] Test API calls work correctly

### 4. Assets (Optional)
- [ ] Create or add app icon to `assets/icon.png` (1024x1024)
- [ ] Create or add splash screen to `assets/splash.png`
- [ ] Create or add adaptive icon to `assets/adaptive-icon.png`
- [ ] Create or add favicon to `assets/favicon.png`

### 5. First Run
- [ ] Start development server: `npm start`
- [ ] Wait for Metro bundler to start
- [ ] Choose platform:
  - [ ] Press `i` for iOS simulator (Mac only)
  - [ ] Press `a` for Android emulator
  - [ ] Press `w` for web browser
  - [ ] Scan QR code with Expo Go app on phone

### 6. Verify Core Features
- [ ] App launches without errors
- [ ] Home screen displays properly
- [ ] Can navigate to "Add Channel" screen
- [ ] Can navigate to "Channels" screen
- [ ] Theme colors match Flutter app (red theme)
- [ ] Dark mode works (check device settings)

### 7. Test Functionality
- [ ] Add a test YouTube channel
  - [ ] Try with channel URL
  - [ ] Try with handle (@username)
  - [ ] Verify channel appears in channels list
- [ ] Check videos load for the channel
- [ ] Test video playback
- [ ] Test channel deletion (long press on channel)
- [ ] Test pull-to-refresh on home screen

## Development Workflow

### Daily Development
- [ ] Start dev server: `npm start`
- [ ] Make code changes
- [ ] See hot reload in action
- [ ] Check for TypeScript errors: `npm run type-check`
- [ ] Check for lint errors: `npm run lint`

### Testing on Different Platforms
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical device via Expo Go
- [ ] Test on web browser
- [ ] Test dark mode on all platforms
- [ ] Test different screen sizes

## Production Preparation

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings addressed
- [ ] No console.log statements in production code
- [ ] Error handling implemented
- [ ] Loading states implemented

### Build Configuration
- [ ] Update `app.json` with your app details
  - [ ] App name
  - [ ] Bundle identifier (iOS)
  - [ ] Package name (Android)
  - [ ] Version number
- [ ] Add app icons and splash screens
- [ ] Configure permissions if needed

### Testing Before Build
- [ ] Test all screens work
- [ ] Test all navigation flows
- [ ] Test add/delete operations
- [ ] Test on both light and dark themes
- [ ] Test on different device sizes
- [ ] Test offline behavior
- [ ] Test error states

### Building
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Login to Expo: `eas login`
- [ ] Configure EAS: `eas build:configure`
- [ ] Build for Android: `eas build --platform android`
- [ ] Build for iOS: `eas build --platform ios`

## Troubleshooting

### Common Issues
- [ ] If dependencies fail: Delete `node_modules`, run `npm install`
- [ ] If metro bundler fails: Run `npm start -- --clear`
- [ ] If iOS build fails: Check Xcode is installed and updated
- [ ] If Android build fails: Check Android Studio SDK is configured
- [ ] If API calls fail: Verify API key is correct and API is enabled

### Performance
- [ ] Check for unnecessary re-renders
- [ ] Optimize images
- [ ] Use React.memo where appropriate
- [ ] Test on lower-end devices

## Documentation Review

- [ ] Read `TRANSFORMATION_COMPLETE.md` for overview
- [ ] Read `SETUP_REACT_NATIVE.md` for detailed setup
- [ ] Read `README_REACT_NATIVE.md` for project documentation
- [ ] Read `MIGRATION_GUIDE.md` for Flutter comparison

## Optional Enhancements

- [ ] Set up CI/CD pipeline
- [ ] Add analytics
- [ ] Add crash reporting (Sentry)
- [ ] Add app version checking
- [ ] Add offline mode indicators
- [ ] Add video download feature
- [ ] Add video quality selection
- [ ] Add playback speed control
- [ ] Add share functionality
- [ ] Add notification support

## Status

**Current Status:** ⚠️ Setup Required

**Next Action:** Run `npm install` and configure YouTube API key

---

Once you complete all items in the "Installation Steps" section, your app will be ready for development!

**Quick Start Command:**
```bash
./setup.sh && npm start
```

Good luck! 🚀
