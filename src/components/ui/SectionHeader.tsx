import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <View className={`flex-row justify-between items-baseline mb-3 ${className}`}>
      <Text className="text-title-md font-inter-medium text-txt-primary">
        {title}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          className="px-3 py-1 rounded-full border border-accent-500"
        >
          <Text className="text-label-lg font-inter-medium text-accent-500">
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
