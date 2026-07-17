import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useRouter } from 'expo-router';
import { useSignUp } from '@clerk/expo';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { COLORS } from '@/constants/theme';
import {
  AUTH_CREATE_ACCOUNT_TITLE,
  AUTH_CREATE_ACCOUNT_BUTTON,
  AUTH_EMAIL_LABEL,
  AUTH_EMAIL_PLACEHOLDER,
  AUTH_PASSWORD_LABEL,
  AUTH_PASSWORD_PLACEHOLDER,
  AUTH_HAVE_ACCOUNT_PROMPT,
  AUTH_SIGN_IN,
  AUTH_VERIFY_TITLE,
  authVerifySubtitle,
  AUTH_CODE_LABEL,
  AUTH_CODE_PLACEHOLDER,
  AUTH_VERIFY_BUTTON,
  AUTH_RESEND_CODE,
  AUTH_CHANGE_EMAIL,
  AUTH_SHOW,
  AUTH_HIDE,
  AUTH_ERROR_EMAIL_INVALID,
  AUTH_ERROR_EMAIL_EXISTS,
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

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();

  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [codeError, setCodeError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [emailExists, setEmailExists] = useState(false);

  const busy = fetchStatus === 'fetching';

  const finishSignUp = useCallback(async () => {
    const { error } = await signUp.finalize();
    if (error) {
      setFormError(authErrorMessage(error.code));
      return;
    }
    router.replace('/(tabs)');
  }, [signUp, router]);

  const handleCreate = useCallback(async () => {
    const nextEmailError = EMAIL_REGEX.test(email) ? undefined : AUTH_ERROR_EMAIL_INVALID;
    const nextPasswordError = getPasswordError(password) ?? undefined;
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    setFormError(undefined);
    setEmailExists(false);
    if (nextEmailError || nextPasswordError) return;

    try {
      const { error } = await signUp.password({ emailAddress: email, password });
      if (error) {
        switch (error.code) {
          case 'form_identifier_exists':
            setEmailExists(true);
            setEmailError(AUTH_ERROR_EMAIL_EXISTS);
            break;
          case 'form_param_format_invalid':
            setEmailError(AUTH_ERROR_EMAIL_INVALID);
            break;
          case 'form_password_length_too_short':
          case 'form_password_pwned':
            setPasswordError(authErrorMessage(error.code));
            break;
          default:
            setFormError(authErrorMessage(error.code));
        }
        return;
      }

      if (signUp.status === 'complete') {
        await finishSignUp();
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();
      if (sendError) {
        setFormError(authErrorMessage(sendError.code));
        return;
      }
      setStep('verify');
    } catch {
      setFormError(AUTH_ERROR_NETWORK);
    }
  }, [email, password, signUp, finishSignUp]);

  const handleVerify = useCallback(async () => {
    setCodeError(undefined);
    setFormError(undefined);
    const trimmed = code.trim();
    if (trimmed.length === 0) {
      setCodeError(AUTH_ERROR_CODE_INCORRECT);
      return;
    }

    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code: trimmed });
      if (error) {
        setCodeError(authErrorMessage(error.code));
        return;
      }
      if (signUp.status === 'complete') {
        await finishSignUp();
      } else {
        setFormError(AUTH_ERROR_SERVER);
      }
    } catch {
      setFormError(AUTH_ERROR_NETWORK);
    }
  }, [code, signUp, finishSignUp]);

  const handleResend = useCallback(async () => {
    setCodeError(undefined);
    setFormError(undefined);
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) setFormError(authErrorMessage(error.code));
    } catch {
      setFormError(AUTH_ERROR_NETWORK);
    }
  }, [signUp]);

  const handleChangeEmail = useCallback(async () => {
    setCode('');
    setCodeError(undefined);
    setFormError(undefined);
    await signUp.reset();
    setStep('form');
  }, [signUp]);

  return (
    <ScrollView
      className="flex-1 bg-parchment"
      contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {step === 'form' ? (
        <>
          <Text style={styles.title}>{AUTH_CREATE_ACCOUNT_TITLE}</Text>

          <View className="mt-6">
            <AuthField
              label={AUTH_EMAIL_LABEL}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (emailError) setEmailError(undefined);
              }}
              onBlur={() => {
                if (email.length > 0 && !EMAIL_REGEX.test(email)) {
                  setEmailError(AUTH_ERROR_EMAIL_INVALID);
                }
              }}
              placeholder={AUTH_EMAIL_PLACEHOLDER}
              error={emailError}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />
            {emailExists ? (
              <Pressable className="-mt-3 mb-4" onPress={() => router.replace('/login')}>
                <Text style={styles.link}>{AUTH_SIGN_IN}</Text>
              </Pressable>
            ) : null}

            <AuthField
              label={AUTH_PASSWORD_LABEL}
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                if (passwordError) setPasswordError(undefined);
              }}
              placeholder={AUTH_PASSWORD_PLACEHOLDER}
              error={passwordError}
              secure
              autoComplete="new-password"
              textContentType="newPassword"
            />
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Button
            className="mt-2 w-full"
            size="lg"
            onPress={handleCreate}
            loading={busy}
            disabled={busy}
          >
            {AUTH_CREATE_ACCOUNT_BUTTON}
          </Button>

          {/* Clerk bot-protection mount point (required on sign-up screens) */}
          <View nativeID="clerk-captcha" />

          <View className="mt-6 flex-row justify-center">
            <Text style={styles.muted}>{AUTH_HAVE_ACCOUNT_PROMPT} </Text>
            <Pressable onPress={() => router.replace('/login')}>
              <Text style={styles.link}>{AUTH_SIGN_IN}</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.title}>{AUTH_VERIFY_TITLE}</Text>
          <Text style={styles.subtitle}>{authVerifySubtitle(email)}</Text>

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
          </View>

          {formError ? <Text style={styles.formError}>{formError}</Text> : null}

          <Button
            className="mt-2 w-full"
            size="lg"
            onPress={handleVerify}
            loading={busy}
            disabled={busy}
          >
            {AUTH_VERIFY_BUTTON}
          </Button>

          <View className="mt-6 items-center gap-4">
            <Pressable onPress={handleResend} disabled={busy}>
              <Text style={styles.link}>{AUTH_RESEND_CODE}</Text>
            </Pressable>
            <Pressable onPress={handleChangeEmail} disabled={busy}>
              <Text style={styles.muted}>{AUTH_CHANGE_EMAIL}</Text>
            </Pressable>
          </View>
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
