import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';
import { COLORS } from '@/constants/theme';
import { AUTH_GET_STARTED, AUTH_SIGN_IN, AUTH_CONTINUE_WITHOUT_ACCOUNT } from '@/constants/strings';
import { useSkippedAuth } from '@/store/useAuthStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const skip = useSkippedAuth((s) => s.skip);

  const handleSkip = useCallback(async () => {
    await skip();
    router.replace('/(tabs)');
  }, [skip, router]);

  return (
    <View
      className="flex-1 bg-parchment px-6"
      style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
    >
      {/* Brand block */}
      <View className="flex-1 items-center justify-center">
        {/* Logo placeholder — replaced with the final mark in a later pass */}
        <View
          className="mb-6 items-center justify-center"
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: COLORS.emberPale,
            borderWidth: 2,
            borderColor: COLORS.ember,
          }}
        >
          <Text style={{ fontFamily: 'Cormorant-SemiBold', fontSize: 44, color: COLORS.ember }}>
            {APP_NAME.charAt(0)}
          </Text>
        </View>

        <Text style={{ fontFamily: 'Cormorant-SemiBold', fontSize: 40, color: COLORS.bark }}>
          {APP_NAME}
        </Text>
        <Text
          className="mt-2 text-center"
          style={{ fontFamily: 'DMSans-Regular', fontSize: 15, color: COLORS.dusk }}
        >
          {APP_TAGLINE}
        </Text>
      </View>

      {/* Actions */}
      <View className="gap-3">
        <Button className="w-full" size="lg" onPress={() => router.push('/register')}>
          {AUTH_GET_STARTED}
        </Button>
        <Button
          className="w-full"
          variant="secondary"
          size="lg"
          onPress={() => router.push('/login')}
        >
          {AUTH_SIGN_IN}
        </Button>
        <Button className="w-full" variant="ghost" size="lg" onPress={handleSkip}>
          <Text style={{ fontFamily: 'DMSans-Medium', fontSize: 14, color: COLORS.dusk }}>
            {AUTH_CONTINUE_WITHOUT_ACCOUNT}
          </Text>
        </Button>
      </View>
    </View>
  );
}
