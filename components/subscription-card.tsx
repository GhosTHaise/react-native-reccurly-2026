import { formatCurrency, formatSubscriptionDateTime } from '@/lib/utils'
import clsx from 'clsx'
import React from 'react'
import { Image, Text, View } from 'react-native'

const SubscriptionCard = ({name , price, currency, icon, billing , color, category, plan , renewalDate} : SubscriptionCardProps) => {
  return (
    <View className={clsx('sub-card bg-card')} style={color ? {backgroundColor: color} : {}}>
        <View className="sub-head">
            <View className='sub-main'>
                <Image source={icon} className='sub-icon' />
                <View className="sub-copy">
                    <Text className="sub-title" numberOfLines={1}>{name}</Text>
                    <Text className="sub-meta" numberOfLines={1} ellipsizeMode='tail'>
                        {category?.trim() || plan?.trim() || (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}
                    </Text>
                </View>
            </View>

            <View className="sub-price-box">
                <Text className="sub-price">{formatCurrency(price, currency)}</Text>
                <Text className="sub-billing">{billing}</Text>
            </View>
        </View>
    </View>
  )
}

export default SubscriptionCard