import { Link } from "expo-router";
import React, { useEffect } from "react";
import { Text, View, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePostHog } from "posthog-react-native";

export default function Onboarding() {
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture('onboarding_viewed');
  }, [posthog]);

  return (
    <SafeAreaView className="auth-safe-area">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="auth-scroll">
        <View className="auth-content justify-center items-center">
          <View className="auth-brand-block items-center mb-12">
            <View className="auth-logo-mark size-24 mb-6">
              <Text className="text-5xl font-sans-extrabold text-background">R</Text>
            </View>
            <Text className="text-4xl font-sans-extrabold text-primary">Reccurly</Text>
            <Text className="auth-wordmark-sub text-sm">Subscription Manager</Text>
          </View>

          <View className="w-full gap-4 mt-8">
            <Text className="text-2xl font-sans-bold text-primary text-center">
              Master your subscriptions
            </Text>
            <Text className="auth-subtitle text-center mx-auto">
              Track renewals, analyze spending, and never pay for an unused service again.
            </Text>
          </View>

          <View className="w-full gap-4 mt-12">
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity className="auth-button w-full">
                <Text className="auth-button-text">Get Started</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(auth)/sign-in" asChild>
              <TouchableOpacity className="auth-secondary-button w-full">
                <Text className="auth-secondary-button-text">Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
