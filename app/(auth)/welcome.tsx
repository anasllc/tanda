import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../src/theme';
import { Button } from '../../src/components/ui';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/(auth)/onboarding');
  };

  return (
    <LinearGradient
      colors={colors.gradients.welcome}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1 px-6">
        {/* Ambient glow */}
        <View className="absolute top-1/4 left-1/2 -translate-x-24 w-48 h-48 rounded-full bg-accent-500/10" />

        <View className="flex-1 items-center justify-center">
          <View className="items-center">
            <Animated.Text
              entering={FadeInDown.delay(0).duration(600).springify()}
              className="text-display-lg font-inter-bold text-accent-400 mb-8"
            >
              Tanda
            </Animated.Text>

            <View className="items-center gap-3">
              <Animated.Text
                entering={FadeInDown.delay(200).duration(500).springify()}
                className="text-headline-sm font-inter-semibold text-txt-secondary text-center"
              >
                Send money instantly
              </Animated.Text>

              <Animated.Text
                entering={FadeInDown.delay(350).duration(500).springify()}
                className="text-headline-sm font-inter-semibold text-txt-secondary text-center"
              >
                Receive money seamlessly
              </Animated.Text>

              <Animated.Text
                entering={FadeInDown.delay(500).duration(500).springify()}
                className="text-headline-sm font-inter-semibold text-txt-secondary text-center"
              >
                Pay for anything
              </Animated.Text>
            </View>
          </View>
        </View>

        <Animated.View
          entering={FadeInDown.delay(700).duration(500).springify()}
          className="pb-8"
        >
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            fullWidth
            size="large"
          />

          <Text className="text-body-sm font-inter text-txt-tertiary text-center mt-4">
            By continuing, you agree to our{' '}
            <Text className="text-accent-500">Terms of Service</Text> and{' '}
            <Text className="text-accent-500">Privacy Policy</Text>
          </Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}
