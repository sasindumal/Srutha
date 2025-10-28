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
    primary: '#dc2626', // red-600
    primaryContainer: '#7f1d1d', // red-900
    secondary: '#ef4444', // red-500
    secondaryContainer: '#991b1b', // red-800
    tertiary: '#f87171', // red-400
    error: '#ef4444',
    background: '#111827',
    surface: '#1f2937',
    surfaceVariant: '#374151',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#f9fafb',
    onSurface: '#f9fafb',
  },
};

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

export { lightTheme, darkTheme };
