import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { lightHaptic, withOpacity } from '../../utils';

interface QuickAction {
  id: string;
  label: string;
  icon: React.FC<{ color: string }>;
  route: string;
  color: string;
}

const SendIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const RequestIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2V22M2 12H22"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

const DepositIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5V19M5 12L12 19L19 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const WithdrawIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 19V5M5 12L12 5L19 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const actions: QuickAction[] = [
  { id: 'send', label: 'Send', icon: SendIcon, route: '/(main)/(send)', color: colors.primary[500] },
  { id: 'request', label: 'Request', icon: RequestIcon, route: '/(main)/(profile)/request-money', color: colors.success.main },
  { id: 'deposit', label: 'Add Money', icon: DepositIcon, route: '/(main)/(wallet)/deposit', color: colors.info.main },
  { id: 'withdraw', label: 'Withdraw', icon: WithdrawIcon, route: '/(main)/(wallet)/withdraw', color: colors.warning.main },
];

interface QuickActionButtonProps {
  action: QuickAction;
  onPress: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ action, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
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
    lightHaptic();
    onPress();
  };

  const Icon = action.icon;

  return (
    <Animated.View style={[styles.actionButton, { transform: [{ scale }] }]}>
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        activeOpacity={1}
        style={styles.touchable}
      >
        <View style={[styles.iconContainer, { backgroundColor: withOpacity(action.color, 0.12) }]}>
          <Icon color={action.color} />
        </View>
        <Text style={styles.actionLabel}>{action.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const QuickActions: React.FC = () => {
  const router = useRouter();

  const handleAction = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <QuickActionButton
          key={action.id}
          action={action}
          onPress={() => handleAction(action.route)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[6],
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  touchable: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  actionLabel: {
    ...typography.labelMedium,
    color: colors.text.secondary,
  },
});
