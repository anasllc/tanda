import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../../theme';
import { Button } from './Button';

type EmptyStateType =
  | 'transactions'
  | 'friends'
  | 'notifications'
  | 'search'
  | 'error'
  | 'generic';

interface EmptyStateProps {
  type?: EmptyStateType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

const TransactionsIllustration = () => (
  <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
    <Circle cx={60} cy={60} r={50} fill={colors.background.secondary} />
    <Rect x={35} y={40} width={50} height={8} rx={4} fill={colors.border.light} />
    <Rect x={35} y={56} width={40} height={8} rx={4} fill={colors.border.light} />
    <Rect x={35} y={72} width={30} height={8} rx={4} fill={colors.border.light} />
  </Svg>
);

const FriendsIllustration = () => (
  <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
    <Circle cx={60} cy={60} r={50} fill={colors.background.secondary} />
    <Circle cx={45} cy={55} r={15} fill={colors.border.light} />
    <Circle cx={75} cy={55} r={15} fill={colors.border.light} />
    <Path
      d="M30 85C30 75 37 70 45 70C53 70 60 75 60 85"
      fill={colors.border.light}
    />
    <Path
      d="M60 85C60 75 67 70 75 70C83 70 90 75 90 85"
      fill={colors.border.light}
    />
  </Svg>
);

const NotificationsIllustration = () => (
  <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
    <Circle cx={60} cy={60} r={50} fill={colors.background.secondary} />
    <Path
      d="M60 35C48 35 40 45 40 55V70L35 80H85L80 70V55C80 45 72 35 60 35Z"
      fill={colors.border.light}
    />
    <Circle cx={60} cy={85} r={8} fill={colors.border.light} />
  </Svg>
);

const SearchIllustration = () => (
  <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
    <Circle cx={60} cy={60} r={50} fill={colors.background.secondary} />
    <Circle cx={55} cy={55} r={20} stroke={colors.border.light} strokeWidth={6} fill="none" />
    <Path
      d="M70 70L85 85"
      stroke={colors.border.light}
      strokeWidth={6}
      strokeLinecap="round"
    />
  </Svg>
);

const ErrorIllustration = () => (
  <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
    <Circle cx={60} cy={60} r={50} fill={colors.error.background} />
    <Circle cx={60} cy={60} r={30} stroke={colors.error.main} strokeWidth={4} fill="none" />
    <Path
      d="M50 50L70 70M70 50L50 70"
      stroke={colors.error.main}
      strokeWidth={4}
      strokeLinecap="round"
    />
  </Svg>
);

const GenericIllustration = () => (
  <Svg width={120} height={120} viewBox="0 0 120 120" fill="none">
    <Circle cx={60} cy={60} r={50} fill={colors.background.secondary} />
    <Rect x={40} y={45} width={40} height={30} rx={4} fill={colors.border.light} />
  </Svg>
);

const getIllustration = (type: EmptyStateType) => {
  switch (type) {
    case 'transactions':
      return <TransactionsIllustration />;
    case 'friends':
      return <FriendsIllustration />;
    case 'notifications':
      return <NotificationsIllustration />;
    case 'search':
      return <SearchIllustration />;
    case 'error':
      return <ErrorIllustration />;
    default:
      return <GenericIllustration />;
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View className="items-center justify-center p-8" style={style}>
      {getIllustration(type)}

      <Text className="text-title-lg font-inter-semibold text-txt-primary mt-6 text-center">
        {title}
      </Text>

      {description && (
        <Text className="text-body-md font-inter text-txt-secondary mt-2 text-center max-w-[280px]">
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="medium"
          style={{ marginTop: 24, minWidth: 160 }}
        />
      )}
    </View>
  );
};
