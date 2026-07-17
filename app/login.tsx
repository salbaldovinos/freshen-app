import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignIn } from '@clerk/expo';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { COLORS } from '@/constants/theme';
import {
  AUTH_SIGN_IN_TITLE,
  AUTH_SIGN_IN,
  AUTH_EMAIL_LABEL,
  AUTH_EMAIL_PLACEHOLDER,
  AUTH_PASSWORD_LABEL,
  AUTH_PASSWORD_PLACEHOLDER,
  AUTH_FORGOT_PASSWORD,
  AUTH_NO_ACCOUNT_PROMPT,
  AUTH_GET_STARTED,
  AUTH_RESET_TITLE,
  AUTH_RESET_EMAIL_SUBTITLE,
  AUTH_SEND_RESET_CODE,
  AUTH_RESET_CODE_SUBTITLE,
  AUTH_NEW_PASSWORD_LABEL,
  AUTH_RESET_SUBMIT,
  AUTH_BACK_TO_SIGN_IN,
  AUTH_CODE_LABEL,
  AUTH_CODE_PLACEHOLDER,
  AUTH_SHOW,
  AUTH_HIDE,
  AUTH_ERROR_EMAIL_INVALID,
  AUTH_ERROR_PASSWORD_SHORT,
  AUTH_ERROR_PASSWORD_NO_UPPERCASE,
  AUTH_ERROR_PASSWORD_NO_NUMBER,
  AUTH_ERROR_CODE_INCORRECT,
  AUTH_ERROR_NETWORK,
  AUTH_ERROR_SERVER,
  authErrorMessage,
} from '@/constants/strings';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordError(password: string): string | null {
  if (password.length < 8) return AUTH_ERROR_PASSWORD_SHORT;
  if (!/[A-Z]/.test(password)) return AUTH_ERROR_PASSWORD_NO_UPPERCASE;
  if (!/[0-9]/.test(password)) return AUTH_ERROR_PASSWORD_NO_NUMBER;
  return null;
}

type Mode = 'signin' | 'forgot-email' | 'forgot-reset';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [emailError, setEmailError] = useState<string | undefined>();
  const [codeError, setCodeError] = useState<string | undefined>();
  const [newPasswordError, setNewPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();

  const busy = fetchStatus === 'fetching';

  const clearErrors = useCallback(() => {
    setEmailError(undefined);
    setCodeError(undefined);
    setNewPasswordError(undefined);
    setFormError(undefined);
  }, []);

  const goToSignIn = useCallback(async () => {
    clearErrors();
    setCode('');
    setNewPassword('');
    await signIn.reset();
    setMode('signin');
  }, [clearErrors, signIn]);

  const handleSignIn = useCallback(async () => {
    setFormError(undefined);
    try {
      const { error } = await signIn.password({ emailAddress: email, password });
      if (error) {
        setFormError(authErrorMessage(error.code));
        return;
      }
      if (signIn.status === 'complete') {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setFormError(authErrorMessage(finalizeError.code));
          return;
        }
        router.replace('/(tabs)');
      } else {
        setFormError(AUTH_ERROR_SERVER);
      }
    } catch {
      setFormError(AUTH_ERROR_NETWORK);
    }
  }, [email, password, signIn, router]);

  const handleSendReset = useCallback(async () => {
    const nextEmailError = EMAIL_REGEX.test(email) ? undefined : AUTH_ERROR_EMAIL_INVALID;
    setEmailError(nextEmailError);
    setFormError(undefined);
    if (nextEmailError) return;

    try {
      const { error: createError } = await signIn.create({ identifier: email });
      if (createError) {
        setFormError(authErrorMessage(createError.code));
        return;
      }
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) {
        setFormError(authErrorMessage(error.code));
        return;
      }
      setMode('forgot-reset');
    } catch {
      setFormError(AUTH_ERROR_NETWORK);
    }
  }, [email, signIn]);

  const handleResetPassword = useCallback(async () => {
    setCodeError(undefined);
    setNewPasswordError(undefined);
    setFormError(undefined);

    const trimmed = code.trim();
    if (trimmed.length === 0) {
      setCodeError(AUTH_ERROR_CODE_INCORRECT);
      return;
    }
    const passwordError = getPasswordError(newPassword);
    if (passwordError) {
      setNewPasswordError(passwordError);
      return;
    }

    try {
      const { error: verifyError } = await signIn.resetPasswordEmailCode.verifyCode({
        code: trimmed,
      });
      if (verifyError) {
        setCodeError(authErrorMessage(verifyError.code));
        return;
      }
      // A successful verify moves status to 'needs_new_password'; submitPassword
      // rejects otherwise, so let its error surface rather than pre-checking status.
      const { error: submitError } = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      });
      if (submitError) {
        setNewPasswordError(authErrorMessage(submitError.code));
        return;
      }
      if (signIn.status === 'complete') {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) {
          setFormError(authErrorMessage(finalizeError.code));
          return;
        }
        router.replace('/(tabs)');
      } else {
        setFormError(AUTH_ERROR_SERVER);
      }
    } catch {
      setFormError(AUTH_ERROR_NETWORK);
    }
  }, [code, newPassword, signIn, router]);

  return (
    <ScrollView
      className="flex-1 bg-parchment"
      contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {mode === 'signin' ? (
        <>
          <Text style={styles.title}>{AUTH_SIGN_IN_TITLE}</Text>

          <View className="mt-6">
            <AuthField
              label={AUTH_EMAIL_LABEL}
              value={email}
              onChangeText={setEmail}
              placeholder={AUTH_EMAIL_PLACEHOLDER}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <AuthField
              label={AUTH_PASSWORD_LABEL}
              value={password}
              onChangeText={setPassword}
              placeholder={AUTH_PASSWORD_PLACEHOLDER}
              secure
              autoComplete="current-password"
              textContentType="password"
            />
          </View>

          <Pressable
            className="-mt-1 mb-4 self-start"
            onPress={() => {
              clearErrors();
              setMode('forgot-email');
            }}
          >
            <Text style={styles.link}>{AUTH_FORGOT_PASSWORD}</Text>
          </Pressable>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Button
            className="w-full"
            size="lg"
            onPress={handleSignIn}
            loading={busy}
            disabled={busy || email.length === 0 || password.length === 0}
          >
            {AUTH_SIGN_IN}
          </Button>

          <View className="mt-6 flex-row justify-center">
            <Text style={styles.muted}>{AUTH_NO_ACCOUNT_PROMPT} </Text>
            <Pressable onPress={() => router.replace('/register')}>
              <Text style={styles.link}>{AUTH_GET_STARTED}</Text>
            </Pressable>
          </View>
        </>
      ) : mode === 'forgot-email' ? (
        <>
          <Text style={styles.title}>{AUTH_RESET_TITLE}</Text>
          <Text style={styles.subtitle}>{AUTH_RESET_EMAIL_SUBTITLE}</Text>

          <View className="mt-6">
            <AuthField
              label={AUTH_EMAIL_LABEL}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) setEmailError(undefined);
              }}
              placeholder={AUTH_EMAIL_PLACEHOLDER}
              error={emailError}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Button
            className="w-full"
            size="lg"
            onPress={handleSendReset}
            loading={busy}
            disabled={busy || email.length === 0}
          >
            {AUTH_SEND_RESET_CODE}
          </Button>

          <Pressable className="mt-6 items-center" onPress={goToSignIn} disabled={busy}>
            <Text style={styles.link}>{AUTH_BACK_TO_SIGN_IN}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.title}>{AUTH_RESET_TITLE}</Text>
          <Text style={styles.subtitle}>{AUTH_RESET_CODE_SUBTITLE}</Text>

          <View className="mt-6">
            <AuthField
              label={AUTH_CODE_LABEL}
              value={code}
              onChangeText={(value) => {
                setCode(value);
                if (codeError) setCodeError(undefined);
              }}
              placeholder={AUTH_CODE_PLACEHOLDER}
              error={codeError}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
            />
            <AuthField
              label={AUTH_NEW_PASSWORD_LABEL}
              value={newPassword}
              onChangeText={(value) => {
                setNewPassword(value);
                if (newPasswordError) setNewPasswordError(undefined);
              }}
              placeholder={AUTH_PASSWORD_PLACEHOLDER}
              error={newPasswordError}
              secure
              autoComplete="new-password"
              textContentType="newPassword"
            />
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Button
            className="w-full"
            size="lg"
            onPress={handleResetPassword}
            loading={busy}
            disabled={busy}
          >
            {AUTH_RESET_SUBMIT}
          </Button>

          <Pressable className="mt-6 items-center" onPress={goToSignIn} disabled={busy}>
            <Text style={styles.link}>{AUTH_BACK_TO_SIGN_IN}</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

// --- Local field with a password show/hide toggle ---
// The shared ui/input.tsx is copy-paste (do-not-edit) and lacks secureTextEntry /
// autoComplete, so auth screens use this purpose-built field.

interface AuthFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  secure?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  maxLength?: number;
}

function AuthField({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  error,
  secure,
  keyboardType,
  autoComplete,
  textContentType,
  maxLength,
}: AuthFieldProps) {
  const [hidden, setHidden] = useState(true);

  return (
    <View className="mb-4">
      <Text className="font-dm-sans-medium text-[13px] text-bark mb-1.5">{label}</Text>
      <View className="justify-center">
        <TextInput
          className={cn(
            'rounded-md border bg-white px-3 py-2.5 font-dm-sans text-sm text-bark',
            error ? 'border-[1.5px] border-[#B34030]' : 'border-sand',
          )}
          style={secure ? { paddingRight: 60 } : undefined}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder}
          placeholderTextColor="#B8A898"
          secureTextEntry={secure && hidden}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          textContentType={textContentType}
          maxLength={maxLength}
        />
        {secure ? (
          <Pressable
            className="absolute right-3"
            hitSlop={8}
            onPress={() => setHidden((prev) => !prev)}
          >
            <Text style={styles.toggle}>{hidden ? AUTH_SHOW : AUTH_HIDE}</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="font-dm-sans text-[13px] text-[#9E3A28] mt-1">{error}</Text> : null}
    </View>
  );
}

const styles = {
  title: { fontFamily: 'Cormorant-SemiBold', fontSize: 32, color: COLORS.bark },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: COLORS.dusk,
    marginTop: 8,
    lineHeight: 22,
  },
  muted: { fontFamily: 'DMSans-Regular', fontSize: 14, color: COLORS.dusk },
  link: { fontFamily: 'DMSans-Medium', fontSize: 14, color: COLORS.ember },
  toggle: { fontFamily: 'DMSans-Medium', fontSize: 13, color: COLORS.ember },
  formError: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: COLORS.destructive,
    marginBottom: 12,
  },
} as const;
