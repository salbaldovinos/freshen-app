import '../global.css';

import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { Text, View } from 'react-native';
import 'react-native-reanimated';

import { Toast } from '@/components/ui/toast';
import { COLORS } from '@/constants/theme';
import { useInitializeDatabase } from '@/db/client';
import { useAuthGate } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!clerkPublishableKey) {
  throw new Error('Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to the .env file');
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.parchment,
    card: COLORS.white,
    text: COLORS.bark,
    border: COLORS.flax,
    primary: COLORS.ember,
  },
};

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    'Cormorant-Regular': require('../assets/fonts/Cormorant-Regular.ttf'),
    'Cormorant-Medium': require('../assets/fonts/Cormorant-Medium.ttf'),
    'Cormorant-SemiBold': require('../assets/fonts/Cormorant-SemiBold.ttf'),
    'Cormorant-Bold': require('../assets/fonts/Cormorant-Bold.ttf'),
    'Cormorant-Italic': require('../assets/fonts/Cormorant-Italic.ttf'),
    'Cormorant-MediumItalic': require('../assets/fonts/Cormorant-MediumItalic.ttf'),
    'DMSans-Light': require('../assets/fonts/DMSans-Light.ttf'),
    'DMSans-Regular': require('../assets/fonts/DMSans-Regular.ttf'),
    'DMSans-Medium': require('../assets/fonts/DMSans-Medium.ttf'),
    'DMSans-SemiBold': require('../assets/fonts/DMSans-SemiBold.ttf'),
  });

  const { success: dbReady, error: dbError } = useInitializeDatabase();

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (dbError) throw dbError;
  }, [dbError]);

  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, dbReady]);

  if (!loaded || !dbReady) {
    if (dbError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Database initialization failed.</Text>
        </View>
      );
    }
    return null;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <RootLayoutNav />
    </ClerkProvider>
  );
}

function GlobalToast() {
  const message = useToastStore((s) => s.message);
  const dismiss = useToastStore((s) => s.dismiss);
  const handleDismiss = useCallback(() => dismiss(), [dismiss]);

  return <Toast message={message ?? ''} visible={message !== null} onDismiss={handleDismiss} />;
}

function RootLayoutNav() {
  useAuthGate();

  return (
    <ThemeProvider value={navTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.parchment },
          headerTintColor: COLORS.bark,
          headerTitleStyle: {
            fontFamily: 'Cormorant-Medium',
            fontSize: 24,
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: '' }} />
        <Stack.Screen name="register" options={{ title: '' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="breeding/[id]" options={{ title: '' }} />
        <Stack.Screen name="birth/[breedingId]" options={{ title: 'Log birth' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <GlobalToast />
    </ThemeProvider>
  );
}
