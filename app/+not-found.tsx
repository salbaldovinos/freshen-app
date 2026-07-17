import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-parchment p-5">
        <Text className="font-dm-sans-medium text-xl text-bark">
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/" className="mt-4 py-4">
          <Text className="font-dm-sans text-sm text-ember">Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}
