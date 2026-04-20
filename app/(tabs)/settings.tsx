import { useAuth, useUser } from "@clerk/expo";
import React from "react";
import { Text, View, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  const { signOut } = useAuth();
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-8">
        <Text className="text-3xl font-sans-bold text-primary mb-8">Settings</Text>

        <View className="auth-card mb-8">
          <View className="flex-row items-center gap-4">
            <Image
              source={{ uri: user?.imageUrl }}
              className="size-16 rounded-full"
            />
            <View>
              <Text className="text-xl font-sans-bold text-primary">
                {user?.fullName || "User"}
              </Text>
              <Text className="text-sm font-sans-medium text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-4">
          <Text className="text-xs font-sans-bold uppercase tracking-widest text-muted-foreground px-1">
            Account
          </Text>

          <TouchableOpacity className="auth-secondary-button border-destructive/20 bg-destructive/5" onPress={() => signOut()}>
            <Text className="auth-secondary-button-text text-destructive">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
