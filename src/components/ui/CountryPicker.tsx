import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme';
import { SearchBar } from './SearchBar';
import { lightHaptic } from '../../utils/haptics';

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '\u{1F1F3}\u{1F1EC}' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '\u{1F1EC}\u{1F1ED}' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '\u{1F1F0}\u{1F1EA}' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '\u{1F1FF}\u{1F1E6}' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '\u{1F1E8}\u{1F1E6}' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '\u{1F1E6}\u{1F1EA}' },
];

interface CountryPickerProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
}

const ChevronDown = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 9L12 15L18 9"
      stroke={colors.text.secondary}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CountryPicker: React.FC<CountryPickerProps> = ({
  selectedCountry,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery)
  );

  const handleSelect = (country: Country) => {
    lightHaptic();
    onSelect(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      className={`flex-row items-center py-3 px-3 rounded-lg
        ${item.code === selectedCountry.code ? 'bg-accent-500/20' : ''}
      `}
      onPress={() => handleSelect(item)}
    >
      <Text className="text-2xl mr-3">{item.flag}</Text>
      <View className="flex-1">
        <Text className="text-body-lg font-inter text-txt-primary">{item.name}</Text>
        <Text className="text-body-sm font-inter text-txt-secondary mt-0.5">{item.dialCode}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        className="flex-row items-center bg-bg-tertiary px-3 py-2 rounded-lg border border-border gap-2"
        onPress={() => setIsOpen(true)}
      >
        <Text className="text-xl">{selectedCountry.flag}</Text>
        <Text className="text-body-lg font-inter text-txt-primary">{selectedCountry.dialCode}</Text>
        <ChevronDown />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-end">
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setIsOpen(false)}
            activeOpacity={1}
          />
          <View className="bg-bg-elevated rounded-t-3xl px-5 pb-8 max-h-[70%]">
            <View className="w-9 h-1 bg-border-light rounded-sm self-center mt-3 mb-4" />
            <Text className="text-headline-sm font-inter-semibold text-txt-primary mb-4">
              Select Country
            </Text>

            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search countries..."
            />

            <FlatList
              data={filteredCountries}
              renderItem={renderCountryItem}
              keyExtractor={(item) => item.code}
              className="mt-4"
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export { countries };
