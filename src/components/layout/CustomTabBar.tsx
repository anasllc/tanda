import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated from 'react-native-reanimated';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadows } from '../../theme';
import { usePressAnimation } from '../../hooks/useAnimations';
import { selectionHaptic } from '../../utils/haptics';

const HomeIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 22V12H15V22" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SendIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WalletIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M20 12V8H6C4.9 8 4 7.1 4 6V18C4 19.1 4.9 20 6 20H20V16" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 6C4 4.9 4.9 4 6 4H18V8" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx={16} cy={14} r={2} stroke={color} strokeWidth={2} />
  </Svg>
);

const BillsIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke={color} strokeWidth={2} strokeLinecap="round" />
    <Path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke={color} strokeWidth={2} />
    <Path d="M9 12H15M9 16H13" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const MoreIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={5} r={2} fill={color} />
    <Circle cx={12} cy={12} r={2} fill={color} />
    <Circle cx={12} cy={19} r={2} fill={color} />
  </Svg>
);

const icons: Record<string, React.FC<{ color: string }>> = {
  '(home)': HomeIcon,
  '(send)': SendIcon,
  '(services)': BillsIcon,
  '(wallet)': WalletIcon,
  '(profile)': MoreIcon,
};

const labels: Record<string, string> = {
  '(home)': 'Home',
  '(send)': 'Send',
  '(services)': 'Bills',
  '(wallet)': 'Wallet',
  '(profile)': 'More',
};

interface TabBarItemProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const TabBarItem: React.FC<TabBarItemProps> = ({
  routeName,
  isFocused,
  onPress,
  onLongPress,
}) => {
  const { animatedStyle, onPressIn, onPressOut } = usePressAnimation(0.9);
  const Icon = icons[routeName] || HomeIcon;
  const label = labels[routeName] || 'Tab';

  const handlePress = () => {
    selectionHaptic();
    onPress();
  };

  const activeColor = isFocused ? colors.primary[400] : colors.text.tertiary;

  return (
    <Animated.View className="flex-1 items-center justify-center" style={animatedStyle}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        className="items-center justify-center py-2"
      >
        {isFocused && (
          <View className="absolute inset-0 bg-accent-500/12 rounded-lg mx-1" />
        )}
        <Icon color={activeColor} />
        <Text
          className="text-label-sm font-inter-medium mt-1"
          style={{ color: activeColor }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const shouldShowTabBar = (state: any): boolean => {
  const currentRoute = state.routes[state.index];
  const nestedState = currentRoute.state;
  if (!nestedState) return true;
  return nestedState.index === 0;
};

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  if (!shouldShowTabBar(state)) {
    return null;
  }

  return (
    <View
      className="absolute bottom-0 left-0 right-0 px-4"
      style={{ paddingBottom: insets.bottom }}
    >
      <BlurView
        intensity={80}
        tint="dark"
        style={[{
          borderRadius: 24,
          overflow: 'hidden',
          marginBottom: 8,
        }, shadows.lg]}
      >
        <View className="flex-row h-[68px] bg-black/50 rounded-3xl border border-border">
          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabBarItem
                key={route.key}
                routeName={route.name}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};
