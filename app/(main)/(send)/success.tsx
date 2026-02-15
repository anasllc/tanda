import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, typography, spacing } from '../../../src/theme';
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
  }>();

  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    successHaptic();

    // Check mark animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.2,
          damping: 8,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 10,
          stiffness: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Text animation (delayed)
    setTimeout(() => {
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 300);

    // Button animation (delayed)
    setTimeout(() => {
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 600);
  }, []);

  const handleDone = () => {
    router.replace('/(main)/(home)');
  };

  const handleSendMore = () => {
    router.replace('/(main)/(send)');
  };

  const amount = parseFloat(params.amount || '0');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.checkContainer,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        >
          <SuccessCheck />
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text style={styles.title}>Money Sent!</Text>
          <Text style={styles.amount}>{formatCurrency(amount)}</Text>
          <Text style={styles.recipient}>
            has been sent to{'\n'}
            <Text style={styles.recipientName}>{params.contactName}</Text>
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: buttonOpacity }]}>
        <Button
          title="Done"
          onPress={handleDone}
          fullWidth
        />
        <Button
          title="Send More"
          onPress={handleSendMore}
          variant="ghost"
          fullWidth
          style={styles.secondaryButton}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[5],
  },
  checkContainer: {
    marginBottom: spacing[8],
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    ...typography.headlineLarge,
    color: colors.success.main,
    marginBottom: spacing[4],
  },
  amount: {
    ...typography.displayMedium,
    color: colors.text.primary,
    marginBottom: spacing[3],
  },
  recipient: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  recipientName: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  secondaryButton: {
    marginTop: spacing[3],
  },
});
