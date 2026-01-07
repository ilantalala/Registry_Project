import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* The screenOptions prop here applies to EVERY screen in your app.
        Setting headerShown: false removes the 'index' text from the top.
      */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* Your main login screen */}
        <Stack.Screen name="index" />
        
        {/* Your registration screen */}
        <Stack.Screen name="register" />
        
        {/* Keeping your existing routes */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}