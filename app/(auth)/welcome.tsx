import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../../src/theme';
import { Button } from '../../src/components/ui';

export default function WelcomeScreen() {
  const router = useRouter();

  // Animation values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const line1Opacity = useRef(new Animated.Value(0)).current;
  const line1TranslateY = useRef(new Animated.Value(20)).current;
  const line2Opacity = useRef(new Animated.Value(0)).current;
  const line2TranslateY = useRef(new Animated.Value(20)).current;
  const line3Opacity = useRef(new Animated.Value(0)).current;
  const line3TranslateY = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Title animation
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(titleTranslateY, {
        toValue: 0,
        damping: 15,
        stiffness: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Line 1 animation (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(line1Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(line1TranslateY, {
          toValue: 0,
          damping: 15,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Line 2 animation (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(line2Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(line2TranslateY, {
          toValue: 0,
          damping: 15,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 350);

    // Line 3 animation (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(line3Opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(line3TranslateY, {
          toValue: 0,
          damping: 15,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 500);

    // Button animation (delayed)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          damping: 15,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 700);
  }, []);

  const handleGetStarted = () => {
    router.push('/(auth)/onboarding');
  };

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Animated.Text
              style={[
                styles.title,
                {
                  opacity: titleOpacity,
                  transform: [{ translateY: titleTranslateY }],
                },
              ]}
            >
              Tanda
            </Animated.Text>

            <View style={styles.taglines}>
              <Animated.Text
                style={[
                  styles.tagline,
                  {
                    opacity: line1Opacity,
                    transform: [{ translateY: line1TranslateY }],
                  },
                ]}
              >
                Send money instantly
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.tagline,
                  {
                    opacity: line2Opacity,
                    transform: [{ translateY: line2TranslateY }],
                  },
                ]}
              >
                Receive money seamlessly
              </Animated.Text>

              <Animated.Text
                style={[
                  styles.tagline,
                  {
                    opacity: line3Opacity,
                    transform: [{ translateY: line3TranslateY }],
                  },
                ]}
              >
                Pay for anything
              </Animated.Text>
            </View>
          </View>
        </View>

        <Animated.View
          style={[
            styles.footer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            },
          ]}
        >
          <Button
            title="Get Started"
            onPress={handleGetStarted}
            fullWidth
            size="large"
          />

          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing[6],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    ...typography.displayLarge,
    color: colors.text.primary,
    marginBottom: spacing[8],
    fontWeight: '700',
  },
  taglines: {
    alignItems: 'center',
    gap: spacing[3],
  },
  tagline: {
    ...typography.headlineSmall,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: spacing[8],
  },
  terms: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing[4],
  },
  link: {
    color: colors.primary[500],
  },
});
