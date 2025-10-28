import React from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTabSwipe } from '../hooks/useTabSwipe';

export const LibraryScreen = ({ navigation }: any) => {
  const panHandlers = useTabSwipe(navigation);
  const menuItems = [
    {
      icon: 'history',
      title: 'History',
      subtitle: 'Watch history',
      route: 'WatchHistory',
    },
    {
      icon: 'playlist-music',
      title: 'Playlists',
      subtitle: 'Your playlists',
      route: 'PlaylistsRoot',
    },
    {
      icon: 'download',
      title: 'Downloads',
      subtitle: 'Downloaded videos',
      route: 'Downloads',
    },
  ];

  return (
    <ScrollView style={styles.container} {...panHandlers}>
      <View style={styles.section}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Icon name={item.icon} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#AAAAAA" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>SRUTHA</Text>
        <TouchableOpacity 
          style={styles.menuItem} 
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.iconContainer}>
            <Icon name="cog" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.menuTitle}>Settings</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#AAAAAA" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
          <View style={styles.iconContainer}>
            <Icon name="help-circle" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.menuTitle}>Help & feedback</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#AAAAAA" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  section: {
    paddingVertical: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AAAAAA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#272727',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#F1F1F1',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#AAAAAA',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#272727',
    marginVertical: 8,
  },
});
