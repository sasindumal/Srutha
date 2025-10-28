import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity } from 'react-native';
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
import { SearchScreen } from '../screens/SearchScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { DownloadsScreen } from '../screens/DownloadsScreen';
import { ShortsScreen } from '../screens/ShortsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HeaderActions = ({ navigation }: any) => (
  <View style={{ flexDirection: 'row' }}>
    <IconButton icon="magnify" iconColor="#F1F1F1" onPress={() => navigation.navigate('Search')} />
  </View>
);

// Bottom Tab Navigator - YouTube style: Home, Shorts, +, Subscriptions, Library
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
        options={({ navigation }) => ({
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
          headerTitle: 'Srutha',
          headerRight: () => <HeaderActions navigation={navigation} />,
        })}
      />
      <Tab.Screen
        name="Subscriptions"
        component={ChannelsScreen}
        options={({ navigation }) => ({
          title: 'Subscriptions',
          tabBarIcon: ({ color, size }) => (
            <Icon name="youtube" size={size} color={color} />
          ),
          headerTitle: 'Subscriptions',
          headerRight: () => <HeaderActions navigation={navigation} />,
        })}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={({ navigation }) => ({
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <Icon name="play-box-multiple-outline" size={size} color={color} />
          ),
          headerTitle: 'Library',
          headerRight: () => <HeaderActions navigation={navigation} />,
        })}
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
          name="Search"
          component={SearchScreen}
          options={{ title: 'Search' }}
        />
        <Stack.Screen
          name="LibraryRoot"
          component={LibraryScreen}
          options={{ title: 'Library' }}
        />
        <Stack.Screen
          name="PlaylistsRoot"
          component={PlaylistsScreen}
          options={({ navigation }) => ({
            title: 'Playlists',
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
        <Stack.Screen
          name="Downloads"
          component={DownloadsScreen}
          options={{ title: 'Downloads' }}
        />
        <Stack.Screen
          name="WatchHistory"
          component={WatchHistoryScreen}
          options={{
            title: 'Watch History',
          }}
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
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
