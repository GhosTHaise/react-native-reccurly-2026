import { useSignIn } from '@clerk/expo';
import { Link, useRouter, type Href } from 'expo-router';
import { styled } from 'nativewind';
import { usePostHog } from 'posthog-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const SafeAreaView = styled(RNSafeAreaView);

const SignIn = () => {
    const { signIn, errors, fetchStatus } = useSignIn();
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
    const passwordValid = password.length > 0;
    const formValid = emailAddress.length > 0 && password.length > 0 && emailValid;

    const onSignInSuccess = async (email: string, decorateUrl: (path: string) => string) => {
        setSuccessMessage('Successfully signed in!');
        setGeneralError(null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        posthog.identify(email, {
            $set: { email: email },
            $set_once: { first_sign_in_date: new Date().toISOString() },
        });
        posthog.capture('user_signed_in', { email: email });

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

        const { error } = await signIn.password({
            emailAddress,
            password,
        });

        if (error) {
            setGeneralError(error.message || 'Invalid email or password');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            console.error(JSON.stringify(error, null, 2));
            posthog.capture('user_sign_in_failed', {
                error_message: error.message,
            });
            return;
        }

        if (signIn.status === 'complete') {
            await signIn.finalize({
                navigate: ({ session, decorateUrl }) => {
                    if (session?.currentTask) {
                        console.log(session?.currentTask);
                        return;
                    }
                    onSignInSuccess(emailAddress, decorateUrl);
                },
            });
        } else if (signIn.status === 'needs_second_factor') {
            // Handle MFA
            setSuccessMessage('MFA Required. Sending code...');
            const { error: mfaError } = await signIn.mfa.sendEmailCode();
            if (mfaError) {
                setGeneralError(mfaError.message);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } else {
                setSuccessMessage('Verification code sent to your email');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        } else if (signIn.status === 'needs_client_trust') {
            const emailCodeFactor = signIn.supportedSecondFactors.find(
                (factor) => factor.strategy === 'email_code'
            );

            if (emailCodeFactor) {
                await signIn.mfa.sendEmailCode();
            }
        }
    };

    const handleVerify = async () => {
        setGeneralError(null);
        const { error } = await signIn.mfa.verifyEmailCode({ code });

        if (error) {
            setGeneralError(error.message || 'Invalid verification code');
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        if (signIn.status === 'complete') {
            await signIn.finalize({
                navigate: ({ session, decorateUrl }) => {
                    if (session?.currentTask) {
                        console.log(session?.currentTask);
                        return;
                    }
                    onSignInSuccess(emailAddress, decorateUrl);
                },
            });
        } else {
            setGeneralError('Sign-in attempt not complete');
            console.error('Sign-in attempt not complete:', signIn);
        }
    };

    // Show verification screen if client trust or MFA is needed
    if (signIn.status === 'needs_client_trust' || signIn.status === 'needs_second_factor') {
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
                                <Text className="auth-title">Verify your identity</Text>
                                <Text className="auth-subtitle">
                                    {signIn.status === 'needs_second_factor' 
                                        ? 'Multi-factor authentication is required' 
                                        : 'We sent a verification code to your email'}
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
                                            {fetchStatus === 'fetching' ? 'Verifying...' : 'Verify'}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        className="auth-secondary-button"
                                        onPress={async () => {
                                            const { error } = await signIn.mfa.sendEmailCode();
                                            if (!error) setSuccessMessage('Code resent');
                                            else setGeneralError(error.message);
                                        }}
                                        disabled={fetchStatus === 'fetching'}
                                    >
                                        <Text className="auth-secondary-button-text">Resend Code</Text>
                                    </Pressable>

                                    <Pressable
                                        className="auth-secondary-button"
                                        onPress={() => {
                                            setGeneralError(null);
                                            setSuccessMessage(null);
                                            signIn.reset();
                                        }}
                                        disabled={fetchStatus === 'fetching'}
                                    >
                                        <Text className="auth-secondary-button-text">Start Over</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // Main sign-in form
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
                            <Text className="auth-title">Welcome back</Text>
                            <Text className="auth-subtitle">
                                Sign in to continue managing your subscriptions
                            </Text>
                        </View>

                        {/* Sign-In Form */}
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
                                    {errors.fields.identifier && (
                                        <Text className="auth-error">{errors.fields.identifier.message}</Text>
                                    )}
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Password</Text>
                                    <TextInput
                                        className={`auth-input ${passwordTouched && !passwordValid && 'auth-input-error'}`}
                                        value={password}
                                        placeholder="Enter your password"
                                        placeholderTextColor="rgba(0, 0, 0, 0.4)"
                                        secureTextEntry
                                        onChangeText={(text) => {
                                            setPassword(text);
                                            if (generalError) setGeneralError(null);
                                        }}
                                        onBlur={() => setPasswordTouched(true)}
                                        autoComplete="password"
                                    />
                                    {passwordTouched && !passwordValid && (
                                        <Text className="auth-error">Password is required</Text>
                                    )}
                                    {errors.fields.password && (
                                        <Text className="auth-error">{errors.fields.password.message}</Text>
                                    )}
                                </View>

                                <Pressable
                                    className={`auth-button ${(!formValid || fetchStatus === 'fetching') && 'auth-button-disabled'}`}
                                    onPress={handleSubmit}
                                    disabled={!formValid || fetchStatus === 'fetching'}
                                >
                                    <Text className="auth-button-text">
                                        {fetchStatus === 'fetching' ? 'Signing In...' : 'Sign In'}
                                    </Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Sign-Up Link */}
                        <View className="auth-link-row">
                            <Text className="auth-link-copy">Don&apos;t have an account?</Text>
                            <Link href="/(auth)/sign-up" asChild>
                                <Pressable>
                                    <Text className="auth-link">Create Account</Text>
                                </Pressable>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignIn;
