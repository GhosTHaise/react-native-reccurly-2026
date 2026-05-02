import { icons } from '@/constants/icons';
import { useSubscriptionStore } from '@/lib/subscription.store';
import { posthog } from '@/src/config/posthog';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

interface CreateSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  'Entertainment',
  'AI Tools',
  'Developer Tools',
  'Design',
  'Productivity',
  'Cloud',
  'Music',
  'Other',
] as const;

type Category = typeof CATEGORIES[number];

const CATEGORY_COLORS: Record<Category, string> = {
  Entertainment: '#f5c542',
  'AI Tools': '#b8d4e3',
  'Developer Tools': '#e8def8',
  Design: '#b8e8d0',
  Productivity: '#d4e8b8',
  Cloud: '#b8c8e3',
  Music: '#e8b8d4',
  Other: '#e3b8c8',
};

const CreateSubscriptionModal = ({ isOpen, onClose }: CreateSubscriptionModalProps) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const { addSubscription } = useSubscriptionStore();

  const validateForm = (): boolean => {
    const newErrors: { name?: string; price?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    const priceValue = parseFloat(price);
    if (!price || isNaN(priceValue) || priceValue <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const priceValue = parseFloat(price);
    const now = dayjs();

    addSubscription({
      id: `sub_${Date.now()}`,
      icon: icons.wallet,
      name: name.trim(),
      price: priceValue,
      currency: 'USD',
      category: selectedCategory ?? 'Other',
      status: 'active',
      startDate: now.toISOString(),
      renewalDate: (frequency === 'Monthly'
        ? now.add(1, 'month')
        : now.add(1, 'year')
      ).toISOString(),
      billing: frequency,
      color: CATEGORY_COLORS[selectedCategory ?? 'Other'],
    });

    posthog.capture('subscription_created',{
      subscription_name : name.trim(),
      subscription_price : price,
      subscription_frequency : frequency,
      subscription_category : selectedCategory ?? 'Other',
    })

    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setFrequency('Monthly');
    setSelectedCategory(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const isValidForm = name.trim() !== '' && !!price && parseFloat(price) > 0;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <Pressable className="modal-overlay" onPress={handleClose}>
          <Pressable className="modal-container" onPress={(e) => e.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={handleClose}>
                <Text className="modal-close-text">✕</Text>
              </Pressable>
            </View>

            <ScrollView
              className="p-5"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 20, paddingBottom: 20 }}
            >
              {/* Name */}
              <View className="auth-field">
                <Text className="auth-label">Name</Text>
                <TextInput
                  className={clsx('auth-input', errors.name && 'border-destructive')}
                  placeholder="Subscription name"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={name}
                  onChangeText={setName}
                  onBlur={() =>
                    setErrors((prev) => ({ ...prev, name: name.trim() ? undefined : 'Name is required' }))
                  }
                />
                {errors.name && (
                  <Text className="text-xs font-sans-medium text-destructive">{errors.name}</Text>
                )}
              </View>

              {/* Price */}
              <View className="auth-field">
                <Text className="auth-label">Price</Text>
                <TextInput
                  className={clsx('auth-input', errors.price && 'border-destructive')}
                  placeholder="0.00"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  onBlur={() =>
                    setErrors((prev) => ({
                      ...prev,
                      price: price && parseFloat(price) > 0 ? undefined : 'Please enter a valid price',
                    }))
                  }
                />
                {errors.price && (
                  <Text className="text-xs font-sans-medium text-destructive">{errors.price}</Text>
                )}
              </View>

              {/* Frequency */}
              <View className="auth-field">
                <Text className="auth-label">Frequency</Text>
                <View className="picker-row">
                  <Pressable
                    className={clsx('picker-option', frequency === 'Monthly' && 'picker-option-active')}
                    onPress={() => setFrequency('Monthly')}
                  >
                    <Text className={clsx('picker-option-text', frequency === 'Monthly' && 'picker-option-text-active')}>
                      Monthly
                    </Text>
                  </Pressable>
                  <Pressable
                    className={clsx('picker-option', frequency === 'Yearly' && 'picker-option-active')}
                    onPress={() => setFrequency('Yearly')}
                  >
                    <Text className={clsx('picker-option-text', frequency === 'Yearly' && 'picker-option-text-active')}>
                      Yearly
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Category */}
              <View className="auth-field">
                <Text className="auth-label">Category</Text>
                <View className="category-scroll">
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      className={clsx(
                        'category-chip',
                        selectedCategory === cat && 'category-chip-active'
                      )}
                      onPress={() =>
                        setSelectedCategory(selectedCategory === cat ? null : cat)
                      }
                    >
                      <Text
                        className={clsx(
                          'category-chip-text',
                          selectedCategory === cat && 'category-chip-text-active'
                        )}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Submit */}
              <Pressable
                className={clsx('auth-button', !isValidForm && 'auth-button-disabled')}
                onPress={handleSubmit}
                disabled={!isValidForm}
              >
                <Text className="auth-button-text">Add Subscription</Text>
              </Pressable>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;