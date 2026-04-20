import { useSignIn } from "@clerk/expo";
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

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      await setActive({ session: completeSignIn.createdSessionId });
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || "An error occurred during sign in");
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
          <View className="auth-content justify-center">
            {/* Logo Section */}
            <View className="auth-brand-block items-center mb-10">
              <View className="auth-logo-mark size-20 items-center justify-center rounded-3xl bg-accent mb-6 shadow-xl">
                <Text className="text-4xl font-sans-extrabold text-background">R</Text>
              </View>
              <Text className="text-4xl font-sans-extrabold text-primary">Welcome Back</Text>
              <Text className="auth-subtitle text-center mt-3">
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            {/* Form Card */}
            <View className="auth-card bg-card p-6 rounded-3xl border border-border shadow-sm">
              <View className="auth-form gap-5">
                <View className="auth-field gap-2">
                  <Text className="text-sm font-sans-semibold text-primary">Email</Text>
                  <TextInput
                    className={`auth-input bg-background rounded-2xl p-4 border ${error ? "border-destructive" : "border-border"}`}
                    autoCapitalize="none"
                    value={emailAddress}
                    placeholder="name@example.com"
                    placeholderTextColor="rgba(0,0,0,0.3)"
                    onChangeText={setEmailAddress}
                    keyboardType="email-address"
                  />
                </View>

                <View className="auth-field gap-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm font-sans-semibold text-primary">Password</Text>
                    <TouchableOpacity>
                      <Text className="text-sm font-sans-bold text-accent">Forgot?</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    className={`auth-input bg-background rounded-2xl p-4 border ${error ? "border-destructive" : "border-border"}`}
                    value={password}
                    placeholder="Enter password"
                    placeholderTextColor="rgba(0,0,0,0.3)"
                    secureTextEntry={true}
                    onChangeText={setPassword}
                  />
                </View>

                {error ? <Text className="text-xs text-destructive">{error}</Text> : null}

                <TouchableOpacity
                  className={`items-center rounded-2xl py-4 ${loading || !emailAddress || !password ? "bg-accent/45" : "bg-accent"}`}
                  onPress={onSignInPress}
                  disabled={loading || !emailAddress || !password}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-base font-sans-bold text-white">Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View className="flex-row items-center justify-center mt-8 gap-1">
              <Text className="text-sm font-sans-medium text-muted-foreground">New here?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <TouchableOpacity>
                  <Text className="text-sm font-sans-bold text-accent">Create an account</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
