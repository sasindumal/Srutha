import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { IconButton } from 'react-native-paper';
import { HomeScreen } from '../screens/HomeScreen';
import { ChannelsScreen } from '../screens/ChannelsScreen';
import { AddChannelScreen } from '../screens/AddChannelScreen';
import { VideoPlayerScreen } from '../screens/VideoPlayerScreen';
import { ChannelVideosScreen } from '../screens/ChannelVideosScreen';
import { PlaylistsScreen } from '../screens/PlaylistsScreen';
import { CreatePlaylistScreen } from '../screens/CreatePlaylistScreen';
import { EditPlaylistScreen } from '../screens/EditPlaylistScreen';
import { PlaylistVideosScreen } from '../screens/PlaylistVideosScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 1,
            shadowOpacity: 0.1,
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'Srutha',
            headerRight: () => (
              <>
                <IconButton
                  icon="playlist-music"
                  size={24}
                  onPress={() => navigation.navigate('Playlists')}
                />
                <IconButton
                  icon="youtube-subscription"
                  size={24}
                  onPress={() => navigation.navigate('Channels')}
                />
              </>
            ),
          })}
        />
        <Stack.Screen
          name="Channels"
          component={ChannelsScreen}
          options={{
            title: 'Channels',
          }}
        />
        <Stack.Screen
          name="AddChannel"
          component={AddChannelScreen}
          options={{
            title: 'Add Channel',
          }}
        />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayerScreen}
          options={{
            title: 'Watch Video',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ChannelVideos"
          component={ChannelVideosScreen}
          options={({ route }: any) => ({
            title: route.params?.channel?.name || 'Channel Videos',
          })}
        />
        <Stack.Screen
          name="Playlists"
          component={PlaylistsScreen}
          options={({ navigation }) => ({
            title: 'Playlists',
            headerRight: () => (
              <IconButton
                icon="plus"
                size={24}
                onPress={() => navigation.navigate('CreatePlaylist')}
              />
            ),
          })}
        />
        <Stack.Screen
          name="CreatePlaylist"
          component={CreatePlaylistScreen}
          options={{
            title: 'Create Playlist',
          }}
        />
        <Stack.Screen
          name="EditPlaylist"
          component={EditPlaylistScreen}
          options={{
            title: 'Edit Playlist',
          }}
        />
        <Stack.Screen
          name="PlaylistVideos"
          component={PlaylistVideosScreen}
          options={({ route }: any) => ({
            title: route.params?.playlist?.name || 'Playlist',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
