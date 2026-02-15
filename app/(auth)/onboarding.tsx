import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
  FadeIn,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors } from '../../src/theme';
import { Button } from '../../src/components/ui';
import { lightHaptic } from '../../src/utils/haptics';

const { width, height } = Dimensions.get('window');

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

interface Slide {
  id: string;
  title: string;
  description: string;
  illustration: React.ReactNode;
  accentColor: string;
}

// Custom SVG illustrations
const SendMoneyIllustration = () => (
  <Svg width={240} height={240} viewBox="0 0 280 280">
    <Defs>
      <SvgGradient id="sendGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colors.primary[400]} />
        <Stop offset="100%" stopColor={colors.primary[600]} />
      </SvgGradient>
    </Defs>
    <Circle cx={140} cy={140} r={120} fill={colors.primary[500] + '08'} />
    <Circle cx={140} cy={140} r={90} fill={colors.primary[500] + '12'} />
    <Rect x={90} y={60} width={100} height={160} rx={16} fill={colors.background.secondary} stroke={colors.primary[500]} strokeWidth={2.5} />
    <Rect x={100} y={75} width={80} height={130} rx={8} fill={colors.background.tertiary} />
    <G transform="translate(115, 110)">
      <Circle cx={25} cy={25} r={30} fill="url(#sendGrad)" />
      <Path d="M35 15L15 35M35 15H20M35 15V30" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </G>
    <Circle cx={200} cy={100} r={15} fill={colors.warning.main} />
    <SvgText x={200} y={105} fontSize={12} fill={colors.background.primary} textAnchor="middle" fontWeight="bold">$</SvgText>
    <Circle cx={220} cy={140} r={12} fill={colors.warning.main} opacity={0.7} />
    <Circle cx={210} cy={180} r={10} fill={colors.warning.main} opacity={0.4} />
  </Svg>
);

const PayBillsIllustration = () => (
  <Svg width={240} height={240} viewBox="0 0 280 280">
    <Defs>
      <SvgGradient id="billGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colors.success.main} />
        <Stop offset="100%" stopColor={colors.success.dark} />
      </SvgGradient>
    </Defs>
    <Circle cx={140} cy={140} r={120} fill={colors.success.main + '08'} />
    <Circle cx={140} cy={140} r={90} fill={colors.success.main + '12'} />
    <Path d="M80 50 L200 50 L200 210 L190 200 L180 210 L170 200 L160 210 L150 200 L140 210 L130 200 L120 210 L110 200 L100 210 L90 200 L80 210 Z" fill={colors.background.secondary} stroke={colors.success.main} strokeWidth={2} />
    <Rect x={100} y={80} width={80} height={8} rx={4} fill={colors.text.tertiary} opacity={0.5} />
    <Rect x={100} y={100} width={60} height={8} rx={4} fill={colors.text.tertiary} opacity={0.4} />
    <Rect x={100} y={120} width={70} height={8} rx={4} fill={colors.text.tertiary} opacity={0.3} />
    <Circle cx={180} cy={170} r={25} fill="url(#billGrad)" />
    <Path d="M170 170 L177 177 L192 162" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M225 100 L215 120 L225 120 L210 145 L220 125 L210 125 Z" fill={colors.warning.main} />
  </Svg>
);

const SplitBillsIllustration = () => (
  <Svg width={240} height={240} viewBox="0 0 280 280">
    <Defs>
      <SvgGradient id="splitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colors.info.main} />
        <Stop offset="100%" stopColor={colors.info.dark} />
      </SvgGradient>
    </Defs>
    <Circle cx={140} cy={140} r={120} fill={colors.info.main + '08'} />
    <Circle cx={140} cy={140} r={90} fill={colors.info.main + '12'} />
    <G transform="translate(80, 90)">
      <Circle cx={30} cy={30} r={25} fill={colors.primary[500]} />
      <Circle cx={30} cy={18} r={10} fill="white" />
      <Path d="M15 40 Q30 55 45 40" stroke="white" strokeWidth={3} fill="none" />
    </G>
    <G transform="translate(140, 70)">
      <Circle cx={30} cy={30} r={25} fill={colors.success.main} />
      <Circle cx={30} cy={18} r={10} fill="white" />
      <Path d="M15 40 Q30 55 45 40" stroke="white" strokeWidth={3} fill="none" />
    </G>
    <G transform="translate(110, 150)">
      <Circle cx={30} cy={30} r={25} fill={colors.warning.main} />
      <Circle cx={30} cy={18} r={10} fill="white" />
      <Path d="M15 40 Q30 55 45 40" stroke="white" strokeWidth={3} fill="none" />
    </G>
    <Path d="M110 120 L170 100 M110 120 L140 180 M170 100 L140 180" stroke={colors.info.main} strokeWidth={2} strokeDasharray="5,5" />
    <Circle cx={140} cy={130} r={20} fill="url(#splitGrad)" />
    <Path d="M130 130 L150 130 M140 120 L140 140" stroke="white" strokeWidth={3} strokeLinecap="round" />
  </Svg>
);

const GetStartedIllustration = () => (
  <Svg width={240} height={240} viewBox="0 0 280 280">
    <Defs>
      <SvgGradient id="startGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colors.primary[400]} />
        <Stop offset="100%" stopColor={colors.primary[700]} />
      </SvgGradient>
    </Defs>
    <Circle cx={140} cy={140} r={120} fill={colors.primary[500] + '08'} />
    <Circle cx={140} cy={140} r={90} fill={colors.primary[500] + '12'} />
    <Circle cx={140} cy={130} r={60} fill="url(#startGrad)" />
    <Path d="M115 105 L165 105 M140 105 L140 160" stroke="white" strokeWidth={8} strokeLinecap="round" />
    <G>
      <Path d="M200 80 L205 90 L215 85 L205 95 L210 105 L200 95 L190 100 L195 90 Z" fill={colors.warning.main} />
      <Path d="M70 170 L75 180 L85 175 L75 185 L80 195 L70 185 L60 190 L65 180 Z" fill={colors.warning.main} />
      <Circle cx={220} cy={170} r={8} fill={colors.success.main} />
      <Circle cx={60} cy={100} r={6} fill={colors.info.main} />
    </G>
    <SvgText x={140} y={220} fontSize={14} fill={colors.text.secondary} textAnchor="middle">Money, made simple</SvgText>
  </Svg>
);

const slides: Slide[] = [
  {
    id: '1',
    title: 'Send Money\nInstantly',
    description: 'Transfer money to friends and family in seconds. No hidden fees, just simple payments.',
    illustration: <SendMoneyIllustration />,
    accentColor: colors.primary[500],
  },
  {
    id: '2',
    title: 'Pay for\nAnything',
    description: 'Buy airtime, pay bills, and manage subscriptions all in one place.',
    illustration: <PayBillsIllustration />,
    accentColor: colors.success.main,
  },
  {
    id: '3',
    title: 'Split with\nFriends',
    description: 'Easily split bills and expenses with your group. Everyone pays their fair share.',
    illustration: <SplitBillsIllustration />,
    accentColor: colors.info.main,
  },
  {
    id: '4',
    title: 'Ready to\nStart?',
    description: 'Join thousands of people who trust Tanda for their everyday payments.',
    illustration: <GetStartedIllustration />,
    accentColor: colors.primary[500],
  },
];

const PaginationDot = ({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const dotWidth = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [8, 32, 8],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.25, 1, 0.25],
      Extrapolation.CLAMP,
    );
    return { width: dotWidth, opacity };
  });

  return (
    <Animated.View
      className="h-[5px] rounded-full bg-accent-500"
      style={animatedStyle}
    />
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

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

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const isLastSlide = currentIndex === slides.length - 1;

  const getItemLayout = (_: any, index: number) => ({
    length: width,
    offset: width * index,
    index,
  });

  const renderSlide = ({ item }: { item: unknown }) => {
    const slide = item as Slide;
    return (
      <View style={{ width, flex: 1 }}>
        <View className="flex-1 items-center justify-end pb-8">
          {/* Illustration */}
          <View className="mb-12">
            {slide.illustration}
          </View>

          {/* Text content */}
          <View className="px-8 items-center">
            <Text className="text-[32px] font-inter-bold text-white text-center leading-[40px] mb-4">
              {slide.title}
            </Text>
            <Text className="text-body-lg font-inter text-txt-tertiary text-center leading-[26px] px-2">
              {slide.description}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <SafeAreaView className="flex-1">
        {/* Header with Skip */}
        <View className="flex-row justify-end px-5 pt-2 pb-4">
          {!isLastSlide ? (
            <TouchableOpacity
              onPress={handleSkip}
              className="px-4 py-2 rounded-full bg-bg-tertiary"
            >
              <Text className="text-label-lg font-inter-medium text-txt-secondary">Skip</Text>
            </TouchableOpacity>
          ) : (
            <View className="h-[36px]" />
          )}
        </View>

        {/* Slides - takes up most of the screen */}
        <View style={{ flex: 1 }}>
          <AnimatedFlatList
            ref={flatListRef}
            data={slides}
            renderItem={renderSlide as any}
            keyExtractor={((item: unknown) => (item as Slide).id) as (item: unknown) => string}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={getItemLayout}
            style={{ flex: 1 }}
          />
        </View>

        {/* Footer: Pagination + Button */}
        <View className="px-6 pb-8 pt-6">
          {/* Pagination dots */}
          <View className="flex-row justify-center items-center mb-8 gap-2">
            {slides.map((_, index) => (
              <PaginationDot key={index} index={index} scrollX={scrollX} />
            ))}
          </View>

          {/* Slide counter */}
          <Text className="text-label-md font-inter-medium text-txt-muted text-center mb-4">
            {currentIndex + 1} of {slides.length}
          </Text>

          {/* Action button */}
          <Button
            title={isLastSlide ? 'Get Started' : 'Continue'}
            onPress={handleNext}
            fullWidth
            size="large"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
