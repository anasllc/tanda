import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, layout } from '../../theme';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
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
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
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
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  const withKeyboardDismiss = dismissKeyboardOnTap ? (
    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
      <View style={styles.flex}>{content}</View>
    </TouchableWithoutFeedback>
  ) : (
    content
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.keyboardAvoiding}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {withKeyboardDismiss}
    </KeyboardAvoidingView>
  ) : (
    withKeyboardDismiss
  );

  return (
    <Container style={[styles.container, { backgroundColor }, style]} edges={edges as any}>
      {wrappedContent}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing[6],
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  keyboardAvoiding: {
    flex: 1,
  },
});
