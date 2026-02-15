import React from 'react';
import {
  View,
  ScrollView,
  ViewStyle,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  className?: string;
  scroll?: boolean;
  safeArea?: boolean;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardAvoiding?: boolean;
  dismissKeyboardOnTap?: boolean;
  backgroundColor?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  style,
  contentStyle,
  className = '',
  scroll = true,
  safeArea = true,
  edges = ['top', 'left', 'right'],
  refreshing = false,
  onRefresh,
  keyboardAvoiding = true,
  dismissKeyboardOnTap = true,
  backgroundColor = colors.background.primary,
}) => {
  const Container = safeArea ? SafeAreaView : View;

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const content = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerStyle={[{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 }, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1 px-5" style={contentStyle}>
      {children}
    </View>
  );

  const withKeyboardDismiss = dismissKeyboardOnTap ? (
    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
      <View className="flex-1">{content}</View>
    </TouchableWithoutFeedback>
  ) : (
    content
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {withKeyboardDismiss}
    </KeyboardAvoidingView>
  ) : (
    withKeyboardDismiss
  );

  return (
    <Container
      className={`flex-1 ${className}`}
      style={[{ backgroundColor }, style]}
      edges={edges as any}
    >
      {wrappedContent}
    </Container>
  );
};
