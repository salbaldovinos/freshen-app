import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { COLORS } from '@/constants/theme';

function TabIcon({ label, color }: { label: string; color: string }) {
  return <Text style={{ fontSize: 20, color, marginTop: 2 }}>{label}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.ember,
        tabBarInactiveTintColor: COLORS.mist,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.flax,
        },
        tabBarLabelStyle: {
          fontFamily: 'DMSans-Medium',
          fontSize: 11,
        },
        headerStyle: {
          backgroundColor: COLORS.parchment,
        },
        headerTintColor: COLORS.bark,
        headerTitleStyle: {
          fontFamily: 'Cormorant-Medium',
          fontSize: 24,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'Breeding records',
          tabBarIcon: ({ color }) => <TabIcon label={'\u2302'} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          headerTitle: 'Add breeding',
          tabBarIcon: ({ color }) => <TabIcon label="+" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabIcon label={'\u2699\ufe0e'} color={color} />,
        }}
      />
    </Tabs>
  );
}
