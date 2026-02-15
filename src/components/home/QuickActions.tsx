import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';
import { lightHaptic } from '../../utils/haptics';

interface QuickAction {
  id: string;
  label: string;
  icon: React.FC<{ color: string }>;
  route: string;
  color: string;
}

const SendIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const RequestIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 2V22M2 12H22" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const DepositIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 5V19M5 12L12 19L19 12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WithdrawIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path d="M12 19V5M5 12L12 5L19 12" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const actions: QuickAction[] = [
  { id: 'send', label: 'Send', icon: SendIcon, route: '/(main)/(send)', color: colors.primary[500] },
  { id: 'request', label: 'Request', icon: RequestIcon, route: '/(main)/(profile)/request-money', color: colors.success.main },
  { id: 'deposit', label: 'Add Money', icon: DepositIcon, route: '/(main)/(wallet)/deposit', color: colors.info.main },
  { id: 'withdraw', label: 'Withdraw', icon: WithdrawIcon, route: '/(main)/(wallet)/withdraw', color: colors.warning.main },
];

export const QuickActions: React.FC = () => {
  const router = useRouter();

  const handleAction = (route: string) => {
    lightHaptic();
    router.push(route as any);
  };

  return (
    <View className="flex-row justify-between mt-6 bg-bg-card rounded-2xl p-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <TouchableOpacity
            key={action.id}
            onPress={() => handleAction(action.route)}
            activeOpacity={0.7}
            className="items-center flex-1"
          >
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center mb-2"
              style={{ backgroundColor: action.color + '18' }}
            >
              <Icon color={action.color} />
            </View>
            <Text className="text-label-sm font-inter-medium text-txt-secondary">
              {action.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
