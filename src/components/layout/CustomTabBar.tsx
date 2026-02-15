import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { selectionHaptic } from '../../utils/haptics';

// Tab Icons
const HomeIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12H15V22"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const SendIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const WalletIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 12V8H6C4.9 8 4 7.1 4 6V18C4 19.1 4.9 20 6 20H20V16"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 6C4 4.9 4.9 4 6 4H18V8"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={16} cy={14} r={2} stroke={color} strokeWidth={2} />
  </Svg>
);

const BillsIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z"
      stroke={color}
      strokeWidth={2}
    />
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
  const scale = useRef(new Animated.Value(1)).current;
  const Icon = icons[routeName] || HomeIcon;
  const label = labels[routeName] || 'Tab';

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    selectionHaptic();
    onPress();
  };

  const color = isFocused ? colors.primary[500] : colors.text.tertiary;

  return (
    <Animated.View style={[styles.tabItem, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={styles.tabTouchable}
      >
        <Icon color={color} />
        <Text style={[styles.tabLabel, { color }]}>{label}</Text>
        {isFocused && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    </Animated.View>
  );
};

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

// Check if we should show the tab bar (only on index screens, not nested routes)
const shouldShowTabBar = (state: any): boolean => {
  const currentRoute = state.routes[state.index];
  const nestedState = currentRoute.state;

  // If there's no nested state, we're on the index screen
  if (!nestedState) return true;

  // If nested state exists, only show tab bar if we're on the first route (index)
  return nestedState.index === 0;
};

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  // Hide tab bar on nested screens
  if (!shouldShowTabBar(state)) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[4],
  },
  blur: {
    borderRadius: borderRadius['3xl'],
    overflow: 'hidden',
    marginBottom: spacing[2],
    ...shadows.lg,
  },
  tabBar: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: colors.overlay.medium,
    borderRadius: borderRadius['3xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
  },
  tabLabel: {
    ...typography.labelSmall,
    marginTop: spacing[1],
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary[500],
  },
});
