import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../../../src/theme';
import { Avatar, Badge, Card, Divider } from '../../../src/components/ui';
import { useAuthStore } from '../../../src/stores';
import { lightHaptic } from '../../../src/utils/haptics';

const menuItems = [
  { id: 'banks', label: 'Bank Accounts', icon: 'credit-card', route: '/(main)/(profile)/bank-accounts' },
  { id: 'limits', label: 'Transaction Limits', icon: 'sliders', route: '/(main)/(profile)/limits' },
  { id: 'security', label: 'Security', icon: 'shield', route: '/(main)/(profile)/security' },
  { id: 'help', label: 'Help & Support', icon: 'help', route: '/(main)/(profile)/help' },
  { id: 'about', label: 'About', icon: 'info', route: '/(main)/(profile)/about' },
];

const getIcon = (icon: string) => {
  const props = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none' };
  const stroke = colors.text.secondary;
  switch (icon) {
    case 'credit-card':
      return <Svg {...props}><Rect x={2} y={5} width={20} height={14} rx={2} stroke={stroke} strokeWidth={2} /><Path d="M2 10H22" stroke={stroke} strokeWidth={2} /></Svg>;
    case 'sliders':
      return <Svg {...props}><Path d="M4 21V14M4 10V3M12 21V12M12 8V3M20 21V16M20 12V3M1 14H7M9 8H15M17 16H23" stroke={stroke} strokeWidth={2} strokeLinecap="round" /></Svg>;
    case 'shield':
      return <Svg {...props}><Path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke={stroke} strokeWidth={2} /></Svg>;
    case 'help':
      return <Svg {...props}><Circle cx={12} cy={12} r={10} stroke={stroke} strokeWidth={2} /><Path d="M9 9C9 7.34 10.34 6 12 6C13.66 6 15 7.34 15 9C15 10.31 14.17 11.42 13 11.83V14M12 17H12.01" stroke={stroke} strokeWidth={2} strokeLinecap="round" /></Svg>;
    case 'info':
      return <Svg {...props}><Circle cx={12} cy={12} r={10} stroke={stroke} strokeWidth={2} /><Path d="M12 16V12M12 8H12.01" stroke={stroke} strokeWidth={2} strokeLinecap="round" /></Svg>;
    default:
      return <Svg {...props}><Circle cx={12} cy={12} r={8} stroke={stroke} strokeWidth={2} /></Svg>;
  }
};

export default function MoreScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleMenuPress = (route: string) => {
    lightHaptic();
    router.push(route as any);
  };

  const handleViewProfile = () => {
    lightHaptic();
    router.push('/(main)/(profile)/edit-profile' as any);
  };

  const handleLogout = () => {
    lightHaptic();
    logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-primary" edges={['top']}>
      <ScrollView contentContainerClassName="px-5 pt-4" showsVerticalScrollIndicator={false}>
        <Card className="mb-6">
          <View className="flex-row items-center mb-4">
            <Avatar name={user?.displayName || 'User'} size="xlarge" />
            <View className="ml-4 flex-1">
              <Text className="text-title-lg font-inter-semibold text-txt-primary">{user?.displayName}</Text>
              <Text className="text-body-md font-inter text-accent-500 mt-0.5 mb-2">@{user?.username}</Text>
              {user?.isVerified && <Badge label="Verified" variant="success" size="small" />}
            </View>
          </View>
          <TouchableOpacity
            className="flex-row items-center justify-center py-3 rounded-xl"
            style={{ backgroundColor: colors.primary[500] + '12' }}
            onPress={handleViewProfile}
          >
            <Text className="text-label-lg font-inter-medium text-accent-500 mr-1">View Profile</Text>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M9 18L15 12L9 6" stroke={colors.primary[500]} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </Card>

        <Card className="p-0 overflow-hidden">
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                className="flex-row items-center p-4"
                onPress={() => handleMenuPress(item.route)}
              >
                <View className="mr-4">{getIcon(item.icon)}</View>
                <Text className="text-body-lg font-inter text-txt-primary flex-1">{item.label}</Text>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M9 18L15 12L9 6" stroke={colors.text.tertiary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
              {index < menuItems.length - 1 && <Divider spacing={0} />}
            </React.Fragment>
          ))}
        </Card>

        <TouchableOpacity className="items-center py-4 mt-6" onPress={handleLogout}>
          <Text className="text-title-md font-inter-medium text-error-main">Log Out</Text>
        </TouchableOpacity>

        <Text className="text-body-sm font-inter text-txt-tertiary text-center mt-4">Version 1.0.0</Text>

        <View className="h-[100px]" />
      </ScrollView>
    </SafeAreaView>
  );
}
