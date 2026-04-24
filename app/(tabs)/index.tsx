import ListHeading from '@/components/list-heading';
import SubscriptionCard from '@/components/subscription-card';
import UpcomingSubscriptionCard from '@/components/upcoming-subscription-card';
import { HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS } from '@/constants/data';
import { icons } from '@/constants/icons';
import images from '@/constants/images';
import { formatCurrency } from '@/lib/utils';
import { useUser } from '@clerk/expo';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import { styled } from 'nativewind';
import { useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const { user } = useUser();
  const SafeAreaView = styled(RNSafeAreaView);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<string | null>(null)

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() =>
          <>
            <View className="home-header">
              <TouchableOpacity onPress={() => router.push("/(tabs)/settings")} className="home-user">
                <Image source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar} className="home-avatar" />
                <Text className="home-user-name">{user?.firstName || 'User'}</Text>
              </TouchableOpacity>

              <Image source={icons.add} className="home-add-icon" />
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>
              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">{dayjs(HOME_BALANCE.nextRenewalDate).format('MM/YY')}</Text>
              </View>
            </View>

            <View className='mb-5'>
              <ListHeading
                title="Upcoming"
              />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => <UpcomingSubscriptionCard data={item} />}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No upcoming renewals yet.</Text>}
              />
            </View>
            <ListHeading
              title="All Subscriptions"
            />
          </>
        }
        data={HOME_SUBSCRIPTIONS}
        renderItem={({ item }) => <SubscriptionCard {...item} expanded={expandedSubscriptionId === item.id} onPress={() => setExpandedSubscriptionId((currentId) => currentId === item.id ? null : item.id)} />}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text>}
        contentContainerClassName='pb-30'
      />
    </SafeAreaView>
  );
}