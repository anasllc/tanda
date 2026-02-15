import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../../src/theme';
import { Button } from '../../src/components/ui';
import { lightHaptic } from '../../src/utils/haptics';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
}

// Custom SVG illustrations
const SendMoneyIllustration = () => (
  <Svg width={280} height={280} viewBox="0 0 280 280">
    <Defs>
      <SvgGradient id="sendGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colors.primary[400]} />
        <Stop offset="100%" stopColor={colors.primary[600]} />
      </SvgGradient>
    </Defs>
    {/* Background circles */}
    <Circle cx={140} cy={140} r={120} fill={colors.primary[500] + '10'} />
    <Circle cx={140} cy={140} r={90} fill={colors.primary[500] + '15'} />
    {/* Phone outline */}
    <Rect x={90} y={60} width={100} height={160} rx={16} fill={colors.background.secondary} stroke={colors.primary[500]} strokeWidth={3} />
    {/* Screen */}
    <Rect x={100} y={75} width={80} height={130} rx={8} fill={colors.background.tertiary} />
    {/* Send arrow */}
    <G transform="translate(115, 110)">
      <Circle cx={25} cy={25} r={30} fill="url(#sendGrad)" />
      <Path
        d="M35 15L15 35M35 15H20M35 15V30"
        stroke={colors.white}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
    {/* Flying coins */}
    <Circle cx={200} cy={100} r={15} fill={colors.warning.main} />
    <Text x={200} y={105} fontSize={12} fill={colors.background.primary} textAnchor="middle" fontWeight="bold">$</Text>
    <Circle cx={220} cy={140} r={12} fill={colors.warning.main} opacity={0.7} />
    <Circle cx={210} cy={180} r={10} fill={colors.warning.main} opacity={0.5} />
  </Svg>
);

const PayBillsIllustration = () => (
  <Svg width={280} height={280} viewBox="0 0 280 280">
    <Defs>
      <SvgGradient id="billGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colors.success.main} />
        <Stop offset="100%" stopColor={colors.success.dark} />
      </SvgGradient>
    </Defs>
    {/* Background */}
    <Circle cx={140} cy={140} r={120} fill={colors.success.main + '10'} />
    <Circle cx={140} cy={140} r={90} fill={colors.success.main + '15'} />
    {/* Receipt/Bill */}
    <Path
      d="M80 50 L200 50 L200 210 L190 200 L180 210 L170 200 L160 210 L150 200 L140 210 L130 200 L120 210 L110 200 L100 210 L90 200 L80 210 Z"
      fill={colors.background.secondary}
      stroke={colors.success.main}
      strokeWidth={2}
    />
    {/* Bill lines */}
    <Rect x={100} y={80} width={80} height={8} rx={4} fill={colors.text.tertiary} opacity={0.5} />
    <Rect x={100} y={100} width={60} height={8} rx={4} fill={colors.text.tertiary} opacity={0.4} />
    <Rect x={100} y={120} width={70} height={8} rx={4} fill={colors.text.tertiary} opacity={0.3} />
    {/* Checkmark circle */}
    <Circle cx={180} cy={170} r={25} fill="url(#billGrad)" />
    <Path
      d="M170 170 L177 177 L192 162"
      stroke={colors.white}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Lightning bolt for electricity */}
    <Path
      d="M225 100 L215 120 L225 120 L210 145 L220 125 L210 125 Z"
      fill={colors.warning.main}
    />
  </Svg>
);

const SplitBillsIllustration = () => (
  <Svg width={280} height={280} viewBox="0 0 280 280">
    <Defs>
      <SvgGradient id="splitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colors.info.main} />
        <Stop offset="100%" stopColor={colors.info.dark} />
      </SvgGradient>
    </Defs>
    {/* Background */}
    <Circle cx={140} cy={140} r={120} fill={colors.info.main + '10'} />
    <Circle cx={140} cy={140} r={90} fill={colors.info.main + '15'} />
    {/* People circles */}
    <G transform="translate(80, 90)">
      <Circle cx={30} cy={30} r={25} fill={colors.primary[500]} />
      <Circle cx={30} cy={18} r={10} fill={colors.white} />
      <Path d="M15 40 Q30 55 45 40" stroke={colors.white} strokeWidth={3} fill="none" />
    </G>
    <G transform="translate(140, 70)">
      <Circle cx={30} cy={30} r={25} fill={colors.success.main} />
      <Circle cx={30} cy={18} r={10} fill={colors.white} />
      <Path d="M15 40 Q30 55 45 40" stroke={colors.white} strokeWidth={3} fill="none" />
    </G>
    <G transform="translate(110, 150)">
      <Circle cx={30} cy={30} r={25} fill={colors.warning.main} />
      <Circle cx={30} cy={18} r={10} fill={colors.white} />
      <Path d="M15 40 Q30 55 45 40" stroke={colors.white} strokeWidth={3} fill="none" />
    </G>
    {/* Connecting lines */}
    <Path d="M110 120 L170 100 M110 120 L140 180 M170 100 L140 180" stroke={colors.info.main} strokeWidth={2} strokeDasharray="5,5" />
    {/* Central split icon */}
    <Circle cx={140} cy={130} r={20} fill="url(#splitGrad)" />
    <Path d="M130 130 L150 130 M140 120 L140 140" stroke={colors.white} strokeWidth={3} strokeLinecap="round" />
  </Svg>
);

const GetStartedIllustration = () => (
  <Svg width={280} height={280} viewBox="0 0 280 280">
    <Defs>
      <SvgGradient id="startGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colors.primary[400]} />
        <Stop offset="100%" stopColor={colors.primary[700]} />
      </SvgGradient>
    </Defs>
    {/* Background */}
    <Circle cx={140} cy={140} r={120} fill={colors.primary[500] + '10'} />
    <Circle cx={140} cy={140} r={90} fill={colors.primary[500] + '15'} />
    {/* Logo circle */}
    <Circle cx={140} cy={130} r={60} fill="url(#startGrad)" />
    {/* T for Tanda */}
    <Path
      d="M115 105 L165 105 M140 105 L140 160"
      stroke={colors.white}
      strokeWidth={8}
      strokeLinecap="round"
    />
    {/* Sparkles */}
    <G>
      <Path d="M200 80 L205 90 L215 85 L205 95 L210 105 L200 95 L190 100 L195 90 Z" fill={colors.warning.main} />
      <Path d="M70 170 L75 180 L85 175 L75 185 L80 195 L70 185 L60 190 L65 180 Z" fill={colors.warning.main} />
      <Circle cx={220} cy={170} r={8} fill={colors.success.main} />
      <Circle cx={60} cy={100} r={6} fill={colors.info.main} />
    </G>
    {/* Tagline */}
    <Text x={140} y={220} fontSize={14} fill={colors.text.secondary} textAnchor="middle">Money, made simple</Text>
  </Svg>
);

const slides: Slide[] = [
  {
    id: '1',
    title: 'Send Money Instantly',
    description: 'Transfer money to friends and family in seconds. No hidden fees, just simple payments.',
    illustration: <SendMoneyIllustration />,
  },
  {
    id: '2',
    title: 'Pay for Anything',
    description: 'Buy airtime, pay bills, and manage subscriptions all in one place.',
    illustration: <PayBillsIllustration />,
  },
  {
    id: '3',
    title: 'Split with Friends',
    description: 'Easily split bills and expenses with your group. Everyone pays their fair share.',
    illustration: <SplitBillsIllustration />,
  },
  {
    id: '4',
    title: 'Ready to Start?',
    description: 'Join thousands of people who trust Tanda for their everyday payments.',
    illustration: <GetStartedIllustration />,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleSkip = () => {
    lightHaptic();
    router.push('/(auth)/login');
  };

  const handleNext = () => {
    lightHaptic();
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleGetStarted = () => {
    lightHaptic();
    router.push('/(auth)/login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      <View style={styles.illustrationContainer}>{item.illustration}</View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.pagination}>
      {slides.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotWidth,
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <LinearGradient
      colors={[colors.background.primary, colors.background.secondary]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        {/* Skip button */}
        {!isLastSlide && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}

        {/* Slides */}
        <Animated.FlatList
          ref={flatListRef}
          data={slides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />

        {/* Footer */}
        <View style={styles.footer}>
          {renderPagination()}

          {isLastSlide ? (
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              fullWidth
              size="large"
            />
          ) : (
            <Button
              title="Next"
              onPress={handleNext}
              fullWidth
              size="large"
            />
          )}
        </View>
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
  },
  skipButton: {
    position: 'absolute',
    top: spacing[6],
    right: spacing[5],
    zIndex: 10,
    padding: spacing[2],
  },
  skipText: {
    ...typography.labelLarge,
    color: colors.text.secondary,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  illustrationContainer: {
    marginBottom: spacing[8],
  },
  slideTitle: {
    ...typography.headlineMedium,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  slideDescription: {
    ...typography.bodyLarge,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
    gap: spacing[2],
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },
});
