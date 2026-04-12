import { Link } from "expo-router";
import { styled } from 'nativewind';
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const SafeAreaView = styled(RNSafeAreaView);
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-7xl font-sans-extrabold">
        Home
      </Text>
      <Text className="text-7xl font-bold">
        Home
      </Text>
      <Link href="/onboarding" className="mt-4 rounded bg-primary text-white p-4 font-sans-bold">
        Go to onboarding
      </Link>
    </SafeAreaView>
  );
}