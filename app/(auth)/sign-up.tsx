import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter, type Href } from 'expo-router';
import { useSignUp, useAuth } from '@clerk/expo';
import { useState } from 'react';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import * as Haptics from 'expo-haptics';

const SafeAreaView = styled(RNSafeAreaView);

const SignUp = () => {
    const { signUp, errors, fetchStatus } = useSignUp();
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const posthog = usePostHog();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');

    // General feedback states
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Validation states
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);

    // Client-side validation
    const emailValid = emailAddress.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
    const passwordValid = password.length === 0 || password.length >= 8;
    const formValid = emailAddress.length > 0 && password.length >= 8 && emailValid;

    const onSignUpSuccess = async (email: string, decorateUrl: (path: string) => string) => {
        setSuccessMessage('Successfully created account!');
        setGeneralError(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        posthog.identify(email, {
            $set: { email: email },
            $set_once: { sign_up_date: new Date().toISOString() },
        });
        posthog.capture('user_signed_up', { email: email });

        // Short delay to show success message
        setTimeout(() => {
            const url = decorateUrl('/(tabs)');
            if (url.startsWith('http')) {
                if (typeof window !== 'undefined' && window.location) {
                    window.location.href = url;
                } else {
                    router.replace('/(tabs)' as Href);
                }
            } else {
                router.replace(url as Href);
            }
        }, 1500);
    };

    const handleSubmit = async () => {
        if (!formValid) return;

        setGeneralError(null);
        setSuccessMessage(null);

        const { error } = await signUp.password({
            emailAddress,
            password,
        });

        if (error) {
            setGeneralError(error.message || 'Failed to create account');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            console.error(JSON.stringify(error, null, 2));
            posthog.capture('user_sign_up_failed', {
                error_message: error.message,
            });
            return;
        }

        // Send verification email
        const { error: verifyError } = await signUp.verifications.sendEmailCode();
        if (verifyError) {
            setGeneralError(verifyError.message);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
            setSuccessMessage('Verification code sent to ' + emailAddress);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    };

    const handleVerify = async () => {
        setGeneralError(null);
        const { error } = await signUp.verifications.verifyEmailCode({
            code,
        });

        if (error) {
            setGeneralError(error.message || 'Invalid verification code');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (signUp.status === 'complete') {
            await signUp.finalize({
                navigate: ({ session, decorateUrl }) => {
                    if (session?.currentTask) {
                        console.log(session?.currentTask);
                        return;
                    }
                    onSignUpSuccess(emailAddress, decorateUrl);
                },
            });
        } else {
            setGeneralError('Sign-up attempt not complete');
            console.error('Sign-up attempt not complete:', signUp);
        }
    };

    // Don't show anything if already signed in or sign-up is complete
    if (signUp.status === 'complete' || isSignedIn) {
        return null;
    }

    // Show verification screen if email needs verification
    if (
        signUp.status === 'missing_requirements' &&
        signUp.unverifiedFields.includes('email_address') &&
        signUp.missingFields.length === 0
    ) {
        return (
            <SafeAreaView className="auth-safe-area">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="auth-screen"
                >
                    <ScrollView
                        className="auth-scroll"
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="auth-content">
                            {/* Branding */}
                            <View className="auth-brand-block">
                                <View className="auth-logo-wrap">
                                    <View className="auth-logo-mark">
                                        <Text className="auth-logo-mark-text">R</Text>
                                    </View>
                                    <View>
                                        <Text className="auth-wordmark">Recurrly</Text>
                                        <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                                    </View>
                                </View>
                                <Text className="auth-title">Verify your email</Text>
                                <Text className="auth-subtitle">
                                    We sent a verification code to {emailAddress}
                                </Text>
                            </View>

                            {/* Verification Form */}
                            <View className="auth-card">
                                <View className="auth-form">
                                    {generalError && (
                                        <View className="auth-message-box auth-message-error">
                                            <Text className="auth-message-error-text">{generalError}</Text>
                                        </View>
                                    )}
                                    {successMessage && (
                                        <View className="auth-message-box auth-message-success">
                                            <Text className="auth-message-success-text">{successMessage}</Text>
                                        </View>
                                    )}

                                    <View className="auth-field">
                                        <Text className="auth-label">Verification Code</Text>
                                        <TextInput
                                            className="auth-input"
                                            value={code}
                                            placeholder="Enter 6-digit code"
                                            placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                            onChangeText={(text) => {
                                                setCode(text);
                                                if (generalError) setGeneralError(null);
                                            }}
                                            keyboardType="number-pad"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                        />
                                        {errors.fields.code && (
                                            <Text className="auth-error">{errors.fields.code.message}</Text>
                                        )}
                                    </View>

                                    <Pressable
                                        className={`auth-button ${(!code || fetchStatus === 'fetching') && 'auth-button-disabled'}`}
                                        onPress={handleVerify}
                                        disabled={!code || fetchStatus === 'fetching'}
                                    >
                                        <Text className="auth-button-text">
                                            {fetchStatus === 'fetching' ? 'Verifying...' : 'Verify Email'}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        className="auth-secondary-button"
                                        onPress={async () => {
                                            const { error } = await signUp.verifications.sendEmailCode();
                                            if (!error) setSuccessMessage('Code resent');
                                            else setGeneralError(error.message);
                                        }}
                                        disabled={fetchStatus === 'fetching'}
                                    >
                                        <Text className="auth-secondary-button-text">Resend Code</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // Main sign-up form
    return (
        <SafeAreaView className="auth-safe-area">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="auth-screen"
            >
                <ScrollView
                    className="auth-scroll"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="auth-content">
                        {/* Branding */}
                        <View className="auth-brand-block">
                            <View className="auth-logo-wrap">
                                <View className="auth-logo-mark">
                                    <Text className="auth-logo-mark-text">R</Text>
                                </View>
                                <View>
                                    <Text className="auth-wordmark">Recurrly</Text>
                                    <Text className="auth-wordmark-sub">SUBSCRIPTIONS</Text>
                                </View>
                            </View>
                            <Text className="auth-title">Create your account</Text>
                            <Text className="auth-subtitle">
                                Start tracking your subscriptions and never miss a payment
                            </Text>
                        </View>

                        {/* Sign-Up Form */}
                        <View className="auth-card">
                            <View className="auth-form">
                                {generalError && (
                                    <View className="auth-message-box auth-message-error">
                                        <Text className="auth-message-error-text">{generalError}</Text>
                                    </View>
                                )}
                                {successMessage && (
                                    <View className="auth-message-box auth-message-success">
                                        <Text className="auth-message-success-text">{successMessage}</Text>
                                    </View>
                                )}

                                <View className="auth-field">
                                    <Text className="auth-label">Email Address</Text>
                                    <TextInput
                                        className={`auth-input ${emailTouched && !emailValid && 'auth-input-error'}`}
                                        autoCapitalize="none"
                                        value={emailAddress}
                                        placeholder="name@example.com"
                                        placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                        onChangeText={(text) => {
                                            setEmailAddress(text);
                                            if (generalError) setGeneralError(null);
                                        }}
                                        onBlur={() => setEmailTouched(true)}
                                        keyboardType="email-address"
                                        autoComplete="email"
                                    />
                                    {emailTouched && !emailValid && (
                                        <Text className="auth-error">Please enter a valid email address</Text>
                                    )}
                                    {errors.fields.emailAddress && (
                                        <Text className="auth-error">{errors.fields.emailAddress.message}</Text>
                                    )}
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Password</Text>
                                    <TextInput
                                        className={`auth-input ${passwordTouched && !passwordValid && 'auth-input-error'}`}
                                        value={password}
                                        placeholder="Create a strong password"
                                        placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                        secureTextEntry
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            if (generalError) setGeneralError(null);
                                        }}
                                        onBlur={() => setPasswordTouched(true)}
                                        autoComplete="password-new"
                                    />
                                    {passwordTouched && !passwordValid && (
                                        <Text className="auth-error">Password must be at least 8 characters</Text>
                                    )}
                                    {errors.fields.password && (
                                        <Text className="auth-error">{errors.fields.password.message}</Text>
                                    )}
                                    {!passwordTouched && (
                                        <Text className="auth-helper">Minimum 8 characters required</Text>
                                    )}
                                </View>

                                <Pressable
                                    className={`auth-button ${(!formValid || fetchStatus === 'fetching') && 'auth-button-disabled'}`}
                                    onPress={handleSubmit}
                                    disabled={!formValid || fetchStatus === 'fetching'}
                                >
                                    <Text className="auth-button-text">
                                        {fetchStatus === 'fetching' ? 'Creating Account...' : 'Create Account'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Sign-In Link */}
                        <View className="auth-link-row">
                            <Text className="auth-link-copy">Already have an account?</Text>
                            <Link href="/(auth)/sign-in" asChild>
                                <Pressable>
                                    <Text className="auth-link">Sign In</Text>
                                </Pressable>
                            </Link>
                        </View>

                        {/* Required for Clerk's bot protection */}
                        <View nativeID="clerk-captcha" />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignUp;
