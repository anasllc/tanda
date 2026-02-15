import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isHapticsAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Light haptic feedback - for subtle interactions
 */
export const lightHaptic = () => {
  if (isHapticsAvailable) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

/**
 * Medium haptic feedback - for standard button presses
 */
export const mediumHaptic = () => {
  if (isHapticsAvailable) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};

/**
 * Heavy haptic feedback - for significant actions
 */
export const heavyHaptic = () => {
  if (isHapticsAvailable) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
};

/**
 * Success haptic pattern
 */
export const successHaptic = () => {
  if (isHapticsAvailable) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

/**
 * Warning haptic pattern
 */
export const warningHaptic = () => {
  if (isHapticsAvailable) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
};

/**
 * Error haptic pattern
 */
export const errorHaptic = () => {
  if (isHapticsAvailable) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};

/**
 * Selection haptic - for selection changes
 */
export const selectionHaptic = () => {
  if (isHapticsAvailable) {
    Haptics.selectionAsync();
  }
};

/**
 * Keypad tap haptic
 */
export const keypadHaptic = () => {
  if (isHapticsAvailable) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  }
};

/**
 * PIN success pattern - multiple haptics
 */
export const pinSuccessHaptic = async () => {
  if (isHapticsAvailable) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise(resolve => setTimeout(resolve, 100));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

/**
 * PIN error pattern - shake-like haptics
 */
export const pinErrorHaptic = async () => {
  if (isHapticsAvailable) {
    for (let i = 0; i < 3; i++) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};
