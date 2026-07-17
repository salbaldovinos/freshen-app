import React, { useCallback } from 'react';
import { Alert, Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import Constants from 'expo-constants';

import { COLORS } from '@/constants/theme';
import { PRIVACY_POLICY_URL, TERMS_URL } from '@/constants/app';
import {
  SETTINGS_ACCOUNT,
  SETTINGS_NOTIFICATIONS,
  SETTINGS_DATA,
  SETTINGS_ABOUT,
  SETTINGS_PRIVACY_POLICY,
  SETTINGS_TERMS,
  SETTINGS_VERSION,
  SETTINGS_CREATE_ACCOUNT,
  SETTINGS_SIGN_IN,
  SETTINGS_EXPORT,
  SETTINGS_DUE_DATE_REMINDERS,
  TIER_FEATURE_LOCKED,
} from '@/constants/strings';

// --- Sub-components ---

function SectionHeader({ title }: { title: string }) {
  return (
    <Text
      className="font-dm-sans-medium px-4 pb-2 pt-6"
      style={{
        fontSize: 11,
        letterSpacing: 1.2,
        color: COLORS.mist,
        textTransform: 'uppercase',
      }}
    >
      {title}
    </Text>
  );
}

interface SettingsRowProps {
  label: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  labelColor?: string;
}

function SettingsRow({ label, onPress, trailing, labelColor }: SettingsRowProps) {
  return (
    <Pressable
      className="flex-row items-center justify-between px-4 py-4"
      style={{
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.flax,
      }}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text className="font-dm-sans" style={{ fontSize: 15, color: labelColor ?? COLORS.bark }}>
        {label}
      </Text>
      {trailing ??
        (onPress ? <Text style={{ fontSize: 14, color: COLORS.mist }}>{'>'}</Text> : null)}
    </Pressable>
  );
}

// --- Main screen ---

export default function SettingsScreen() {
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleComingSoon = useCallback(() => {
    Alert.alert('Coming soon', 'This feature will be available in a future update.');
  }, []);

  const handleExportTap = useCallback(() => {
    Alert.alert(TIER_FEATURE_LOCKED, 'Upgrade to unlock data export.');
  }, []);

  const handlePrivacyPolicy = useCallback(() => {
    void Linking.openURL(PRIVACY_POLICY_URL);
  }, []);

  const handleTerms = useCallback(() => {
    void Linking.openURL(TERMS_URL);
  }, []);

  return (
    <ScrollView className="flex-1 bg-parchment">
      {/* ACCOUNT */}
      <SectionHeader title={SETTINGS_ACCOUNT} />
      <View>
        <Pressable
          className="mx-4 items-center justify-center rounded-lg py-3"
          style={{ backgroundColor: COLORS.ember }}
          onPress={handleComingSoon}
        >
          <Text className="font-dm-sans-medium text-sm text-white">{SETTINGS_CREATE_ACCOUNT}</Text>
        </Pressable>
        <Pressable className="mx-4 items-center py-3 mt-2" onPress={handleComingSoon}>
          <Text className="font-dm-sans-medium text-sm" style={{ color: COLORS.ember }}>
            {SETTINGS_SIGN_IN}
          </Text>
        </Pressable>
      </View>

      {/* NOTIFICATIONS */}
      <SectionHeader title={SETTINGS_NOTIFICATIONS} />
      <SettingsRow
        label={SETTINGS_DUE_DATE_REMINDERS}
        trailing={
          <Switch
            value={false}
            onValueChange={handleComingSoon}
            trackColor={{ false: COLORS.sand, true: COLORS.pasture }}
            thumbColor={COLORS.white}
          />
        }
      />

      {/* DATA */}
      <SectionHeader title={SETTINGS_DATA} />
      <SettingsRow
        label={SETTINGS_EXPORT}
        onPress={handleExportTap}
        trailing={
          <View className="flex-row items-center gap-2">
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: COLORS.fog }}>
              <Text className="font-dm-sans text-[11px]" style={{ color: COLORS.dusk }}>
                Pro
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: COLORS.mist }}>{'>'}</Text>
          </View>
        }
      />

      {/* ABOUT */}
      <SectionHeader title={SETTINGS_ABOUT} />
      <SettingsRow label={SETTINGS_PRIVACY_POLICY} onPress={handlePrivacyPolicy} />
      <SettingsRow label={SETTINGS_TERMS} onPress={handleTerms} />
      <SettingsRow
        label={SETTINGS_VERSION}
        trailing={
          <Text className="font-dm-sans text-[15px]" style={{ color: COLORS.mist }}>
            {appVersion}
          </Text>
        }
      />

      {/* Bottom spacing */}
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}
