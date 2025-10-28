import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ChannelProvider } from './src/context/ChannelContext';
import { PlaylistProvider } from './src/context/PlaylistContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { darkTheme } from './src/theme/theme';

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider theme={darkTheme}>
          <ChannelProvider>
            <PlaylistProvider>
              <StatusBar style="light" backgroundColor="#0F0F0F" />
              <AppNavigator />
            </PlaylistProvider>
          </ChannelProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
