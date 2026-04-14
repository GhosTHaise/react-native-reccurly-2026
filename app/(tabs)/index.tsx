import { HOME_USER } from '@/constants/data';
import { icons } from '@/constants/icons';
import images from '@/constants/images';
import { styled } from 'nativewind';
import { Image, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const SafeAreaView = styled(RNSafeAreaView);
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="home-header">
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar" />
          <Text className="home-user-name">{HOME_USER.name}</Text>
        </View>

        <Image source={icons.add} className="home-add-logo" />
      </View>
    </SafeAreaView>
  );
}