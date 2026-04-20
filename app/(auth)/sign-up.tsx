import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="auth-scroll">
          <View className="auth-content">
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Reccurly</Text>
                  <Text className="auth-wordmark-sub">Subscription Manager</Text>
                </View>
              </View>
              <Text className="auth-title">
                {pendingVerification ? "Check your email" : "Join Reccurly"}
              </Text>
              <Text className="auth-subtitle">
                {pendingVerification
                  ? `We've sent a verification code to ${emailAddress}`
                  : "Track all your subscriptions in one place and save money"}
              </Text>
            </View>

            <View className="auth-card">
              {!pendingVerification ? (
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Email Address</Text>
                    <TextInput
                      className={`auth-input ${error ? "auth-input-error" : ""}`}
                      autoCapitalize="none"
                      value={emailAddress}
                      placeholder="name@example.com"
                      placeholderTextColor="rgba(0,0,0,0.3)"
                      onChangeText={setEmailAddress}
                      keyboardType="email-address"
                    />
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Password</Text>
                    <TextInput
                      className={`auth-input ${error ? "auth-input-error" : ""}`}
                      value={password}
                      placeholder="Min. 8 characters"
                      placeholderTextColor="rgba(0,0,0,0.3)"
                      secureTextEntry={true}
                      onChangeText={setPassword}
                    />
                    <Text className="auth-helper">
                      Must contain letters, numbers and symbols
                    </Text>
                  </View>

                  {error ? <Text className="auth-error">{error}</Text> : null}

                  <TouchableOpacity
                    className={`auth-button ${loading || !emailAddress || !password ? "auth-button-disabled" : ""}`}
                    onPress={onSignUpPress}
                    disabled={loading || !emailAddress || !password}
                  >
                    {loading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Create Account</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Verification Code</Text>
                    <TextInput
                      className={`auth-input ${error ? "auth-input-error" : ""}`}
                      value={code}
                      placeholder="123456"
                      placeholderTextColor="rgba(0,0,0,0.3)"
                      onChangeText={setCode}
                      keyboardType="numeric"
                    />
                  </View>

                  {error ? <Text className="auth-error">{error}</Text> : null}

                  <TouchableOpacity
                    className={`auth-button ${loading || !code ? "auth-button-disabled" : ""}`}
                    onPress={onPressVerify}
                    disabled={loading || !code}
                  >
                    {loading ? (
                      <ActivityIndicator color="#081126" />
                    ) : (
                      <Text className="auth-button-text">Verify Email</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="auth-secondary-button"
                    onPress={() => setPendingVerification(false)}
                  >
                    <Text className="auth-secondary-button-text">Back to Sign Up</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {!pendingVerification && (
              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/(auth)/sign-in" asChild>
                  <TouchableOpacity>
                    <Text className="auth-link">Sign in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
