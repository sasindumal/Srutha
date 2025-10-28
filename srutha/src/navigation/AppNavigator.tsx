import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { HomeScreen } from '../screens/HomeScreen';
import { ChannelsScreen } from '../screens/ChannelsScreen';
import { AddChannelScreen } from '../screens/AddChannelScreen';
import { VideoPlayerScreen } from '../screens/VideoPlayerScreen';
import { ChannelVideosScreen } from '../screens/ChannelVideosScreen';
import { ChannelPlaylistScreen } from '../screens/ChannelPlaylistScreen';
import { PlaylistsScreen } from '../screens/PlaylistsScreen';
import { WatchHistoryScreen } from '../screens/WatchHistoryScreen';
import { CreatePlaylistScreen } from '../screens/CreatePlaylistScreen';
import { EditPlaylistScreen } from '../screens/EditPlaylistScreen';
import { PlaylistVideosScreen } from '../screens/PlaylistVideosScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0F0F0F',
          borderTopColor: '#272727',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#AAAAAA',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#0F0F0F',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#272727',
        },
        headerTintColor: '#F1F1F1',
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 18,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
          headerTitle: 'Srutha',
        }}
      />
      <Tab.Screen
        name="Channels"
        component={ChannelsScreen}
        options={{
          title: 'Channels',
          tabBarIcon: ({ color, size }) => (
            <Icon name="youtube-subscription" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Playlists"
        component={PlaylistsScreen}
        options={({ navigation }) => ({
          title: 'Playlists',
          tabBarIcon: ({ color, size }) => (
            <Icon name="playlist-music" size={size} color={color} />
          ),
          headerRight: () => (
            <IconButton
              icon="plus"
              size={24}
              iconColor="#F1F1F1"
              onPress={() => navigation.navigate('CreatePlaylist')}
            />
          ),
        })}
      />
      <Tab.Screen
        name="WatchHistory"
        component={WatchHistoryScreen}
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <Icon name="history" size={size} color={color} />
          ),
          headerTitle: 'Watch History',
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0F0F0F',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#272727',
          },
          headerTintColor: '#F1F1F1',
          headerTitleStyle: {
            fontWeight: '500',
            fontSize: 18,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{
            headerShown: false,
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
            headerShown: true,
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
          name="ChannelPlaylist"
          component={ChannelPlaylistScreen}
          options={({ route }: any) => ({
            title: route.params?.playlist?.title || 'Playlist',
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
