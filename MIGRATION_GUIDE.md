# Flutter to React Native Migration Guide

## Overview

This document explains the transformation from Flutter to React Native Expo.

## Architecture Mapping

### State Management

**Flutter (Provider):**
```dart
ChangeNotifierProvider(
  create: (_) => ChannelProvider(),
  child: MaterialApp(...)
)
```

**React Native (Context API):**
```typescript
<ChannelProvider>
  <NavigationContainer>...</NavigationContainer>
</ChannelProvider>
```

### Database

**Flutter (sqflite):**
```dart
final db = await openDatabase(
  path,
  version: 1,
  onCreate: _createDB,
);
```

**React Native (expo-sqlite):**
```typescript
this.db = await SQLite.openDatabaseAsync('srutha.db');
await this.createTables();
```

### Navigation

**Flutter:**
```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => NewScreen()),
);
```

**React Native (React Navigation):**
```typescript
navigation.navigate('ScreenName', { params });
```

### UI Components

| Flutter Widget | React Native Equivalent |
|----------------|------------------------|
| `Card` | `<Card>` from react-native-paper |
| `FloatingActionButton` | `<FAB>` from react-native-paper |
| `CircularProgressIndicator` | `<ActivityIndicator>` |
| `ListView.builder` | `<FlatList>` |
| `Image.network` | `<Image source={{ uri }}>` |
| `Text` | `<Text>` |
| `Container` | `<View>` |
| `Column` | `<View style={{ flexDirection: 'column' }}>` |
| `Row` | `<View style={{ flexDirection: 'row' }}>` |
| `Padding` | `<View style={{ padding }}>` |

### Styling

**Flutter:**
```dart
TextStyle(
  fontSize: 18,
  fontWeight: FontWeight.w600,
  color: Colors.black,
)
```

**React Native:**
```typescript
{
  fontSize: 18,
  fontWeight: '600',
  color: '#000000',
}
```

## File Structure Comparison

### Flutter
```
lib/
├── main.dart
├── models/
├── providers/
├── screens/
├── services/
└── widgets/
```

### React Native
```
src/
├── components/
├── context/
├── models/
├── navigation/
├── screens/
├── services/
└── theme/
App.tsx
index.js
```

## Code Examples

### Model Definition

**Flutter:**
```dart
class Channel {
  final String id;
  final String name;
  
  Channel({required this.id, required this.name});
  
  Map<String, dynamic> toMap() => {'id': id, 'name': name};
  factory Channel.fromMap(Map<String, dynamic> map) => 
    Channel(id: map['id'], name: map['name']);
}
```

**React Native:**
```typescript
export interface Channel {
  id: string;
  name: string;
}
```

### Component Definition

**Flutter:**
```dart
class VideoCard extends StatelessWidget {
  final Video video;
  final VoidCallback onTap;
  
  const VideoCard({required this.video, required this.onTap});
  
  @override
  Widget build(BuildContext context) {
    return Card(child: InkWell(onTap: onTap, child: ...));
  }
}
```

**React Native:**
```typescript
interface VideoCardProps {
  video: Video;
  onPress: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onPress }) => {
  return <Card onPress={onPress}>...</Card>;
};
```

### State Management

**Flutter:**
```dart
class ChannelProvider with ChangeNotifier {
  List<Channel> _channels = [];
  
  List<Channel> get channels => _channels;
  
  Future<void> loadChannels() async {
    _channels = await db.getAllChannels();
    notifyListeners();
  }
}
```

**React Native:**
```typescript
export const ChannelProvider: React.FC = ({ children }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  
  const loadChannels = async () => {
    const loaded = await db.getAllChannels();
    setChannels(loaded);
  };
  
  return (
    <ChannelContext.Provider value={{ channels, loadChannels }}>
      {children}
    </ChannelContext.Provider>
  );
};
```

### Screen with State

**Flutter:**
```dart
class HomeScreen extends StatefulWidget {
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    context.read<ChannelProvider>().loadVideos();
  }
  
  @override
  Widget build(BuildContext context) {
    return Consumer<ChannelProvider>(
      builder: (context, provider, child) {
        return ListView.builder(...);
      },
    );
  }
}
```

**React Native:**
```typescript
export const HomeScreen = ({ navigation }) => {
  const { videos, loadVideos } = useChannel();
  
  useEffect(() => {
    loadVideos();
  }, []);
  
  return (
    <FlatList
      data={videos}
      renderItem={({ item }) => <VideoCard video={item} />}
    />
  );
};
```

## API Differences

### Async Operations

**Flutter:**
```dart
Future<void> addChannel(String input) async {
  try {
    final channel = await youtubeService.getChannelInfo(input);
    await db.insertChannel(channel);
    notifyListeners();
  } catch (e) {
    print(e);
  }
}
```

**React Native:**
```typescript
const addChannel = async (input: string): Promise<boolean> => {
  try {
    const channel = await youtubeService.getChannelInfo(input);
    await db.insertChannel(channel);
    await loadChannels();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
```

## Testing

### Flutter
```bash
flutter test
```

### React Native
```bash
npm test
```

## Building

### Flutter
```bash
flutter build apk          # Android
flutter build ios          # iOS
```

### React Native
```bash
expo build:android         # Android
expo build:ios            # iOS
eas build --platform all  # EAS Build
```

## Key Takeaways

1. **JavaScript/TypeScript vs Dart:** Different syntax but similar concepts
2. **Component vs Widget:** Same mental model
3. **Props vs Parameters:** Similar passing of data
4. **Hooks vs State:** `useState`, `useEffect` vs `setState`, `initState`
5. **Context vs Provider:** Both for state management
6. **Styling:** Inline vs StyleSheet (both supported)

## Common Patterns

### Loading State

**Flutter:**
```dart
if (isLoading) CircularProgressIndicator()
else ListView(...)
```

**React Native:**
```typescript
{isLoading ? <ActivityIndicator /> : <FlatList />}
```

### Conditional Rendering

**Flutter:**
```dart
if (condition) Widget1() else Widget2()
```

**React Native:**
```typescript
{condition ? <Component1 /> : <Component2 />}
```

### Lists

**Flutter:**
```dart
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
)
```

**React Native:**
```typescript
<FlatList
  data={items}
  renderItem={({ item }) => <ItemComponent item={item} />}
  keyExtractor={(item) => item.id}
/>
```

## Performance Considerations

- React Native: Use `React.memo` for component optimization
- Flutter: Widgets rebuild automatically
- Both: Minimize rebuilds, use keys for lists
- React Native: FlatList has built-in optimizations
- Flutter: ListView.builder is lazy-loaded

## Debugging

**Flutter:**
- Flutter DevTools
- `print()` statements
- `debugPrint()`

**React Native:**
- React Native Debugger
- `console.log()`
- Chrome DevTools

---

This migration maintains the same features and user experience while leveraging React Native's ecosystem and tooling.
