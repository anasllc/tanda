import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, shadows } from '../../../src/theme';
import { Button } from '../../../src/components/ui';
import { formatCurrency } from '../../../src/utils/formatters';
import { successHaptic } from '../../../src/utils/haptics';

const SuccessCheck = () => (
  <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
    <Circle cx={40} cy={40} r={38} fill={colors.success.main} />
    <Path
      d="M24 40L35 51L56 29"
      stroke={colors.white}
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    contactName: string;
    amount: string;
    transactionId?: string;
    reference?: string;
  }>();

  useEffect(() => {
    successHaptic();
  }, []);

  const handleDone = () => {
    router.replace('/(main)/(home)');
  };

  const handleSendMore = () => {
    router.replace('/(main)/(send)');
  };

  const amount = parseFloat(params.amount || '0');

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="flex-1 items-center justify-center px-5">
        {/* Ambient glow behind check */}
        <View className="absolute w-40 h-40 rounded-full bg-success-main/10" />

        {/* Ripple rings */}
        <Animated.View
          entering={ZoomIn.delay(100).duration(800)}
          className="absolute w-32 h-32 rounded-full border border-success-main/10"
        />
        <Animated.View
          entering={ZoomIn.delay(200).duration(800)}
          className="absolute w-44 h-44 rounded-full border border-success-main/5"
        />

        {/* Check mark */}
        <Animated.View
          entering={ZoomIn.delay(0).duration(500).springify()}
          className="mb-8"
          style={shadows.glowSuccess}
        >
          <SuccessCheck />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} className="items-center">
          <Text className="text-headline-lg font-inter-bold text-success-main mb-4">
            Money Sent!
          </Text>
          <Text className="text-display-md font-inter-bold text-txt-primary mb-3" style={{ letterSpacing: -1 }}>
            {formatCurrency(amount)}
          </Text>
          <Text className="text-body-lg font-inter text-txt-secondary text-center leading-relaxed">
            has been sent to{'\n'}
            <Text className="text-txt-primary font-inter-semibold">{params.contactName}</Text>
          </Text>

          {params.reference && (
            <Text className="text-body-sm font-inter text-txt-tertiary mt-4">
              Ref: {params.reference}
            </Text>
          )}
        </Animated.View>
      </View>

      <Animated.View entering={FadeIn.delay(600).duration(400)} className="px-5 pb-8">
        <Button
          title="Done"
          onPress={handleDone}
          fullWidth
        />
        <View className="mt-3">
          <Button
            title="Send More"
            onPress={handleSendMore}
            variant="ghost"
            fullWidth
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
