import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';
import { lightHaptic } from '../../utils/haptics';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  transparent?: boolean;
  style?: ViewStyle;
}

const BackIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={colors.text.primary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  leftElement,
  rightElement,
  transparent = false,
  style,
}) => {
  const router = useRouter();

  const handleBack = () => {
    lightHaptic();
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      className={`h-14 flex-row items-center justify-between px-4 ${transparent ? 'bg-transparent' : 'bg-bg-primary'}`}
      style={style}
    >
      <View className="flex-row items-center min-w-[60px]">
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            className="w-9 h-9 rounded-full bg-bg-tertiary items-center justify-center"
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <BackIcon />
          </TouchableOpacity>
        )}
        {leftElement}
      </View>

      <View className="flex-1 mx-2">
        {title && (
          <Text className="text-headline-sm font-inter-semibold text-txt-primary text-center" numberOfLines={1}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text className="text-body-sm font-inter text-txt-secondary text-center">
            {subtitle}
          </Text>
        )}
      </View>

      <View className="flex-row items-center justify-end min-w-[60px]">
        {rightElement}
      </View>
    </View>
  );
};
