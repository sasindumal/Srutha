import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { useColorScheme } from 'react-native';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#dc2626', // red-600
    primaryContainer: '#fca5a5', // red-300
    secondary: '#991b1b', // red-800
    secondaryContainer: '#fee2e2', // red-100
    tertiary: '#b91c1c', // red-700
    error: '#b91c1c',
    background: '#ffffff',
    surface: '#ffffff',
    surfaceVariant: '#f3f4f6',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#1f2937',
    onSurface: '#1f2937',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FF0000', // YouTube red
    primaryContainer: '#CC0000', // Darker YouTube red
    secondary: '#AAAAAA', // YouTube gray text
    secondaryContainer: '#272727', // YouTube card background
    tertiary: '#3EA6FF', // YouTube blue (links/active)
    error: '#FF0000',
    background: '#0F0F0F', // YouTube main background
    surface: '#212121', // YouTube surface/card
    surfaceVariant: '#3F3F3F', // YouTube hover/selected
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#F1F1F1', // YouTube main text
    onSurface: '#F1F1F1', // YouTube text on cards
    outline: '#717171', // YouTube borders/dividers
  },
};

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

export { lightTheme, darkTheme };
