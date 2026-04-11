import { tabs } from '@/constants/data'
import { colors, components } from '@/constants/theme'
import clsx from 'clsx'
import { Tabs } from 'expo-router'
import { styled } from "nativewind"
import React from 'react'
import { Image, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const tabBar = components.tabBar

const TabIcon = ({ focused, icon }: TabIconProps) => {
  return (
    <View className="tabs-icon">
      <View className={clsx('tabs-pill', focused && "tabs-active")}>
        <Image source={icon} className="tabs-glyph" />
      </View>
    </View>
  )
}

const TabsLayout = () => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: Math.max(insets.bottom, tabBar.horizontalInset),
            height: tabBar.height,
            marginHorizontal: tabBar.horizontalInset,
            borderRadius: tabBar.radius,
            backgroundColor: colors.primary,
            borderTopWidth: 0,
            elevation: 0,
          },
          tabBarItemStyle: {
            paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6
          },
          tabBarIconStyle: {
            width: tabBar.iconFrame,
            height: tabBar.iconFrame,
            alignItems: "center",
          }
        }}>
        {
          tabs.map((tab) => (
            <Tabs.Screen
              name={tab.name}
              key={tab.name}
              options={{
                title: tab.name,
                tabBarIcon: ({ focused }) => (
                  <TabIcon focused={focused} icon={tab.icon} />
                )
              }}
            />
          ))
        }
      </Tabs>
    </SafeAreaView>
  )
}

export default TabsLayout