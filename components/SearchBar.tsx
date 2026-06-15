// components/SearchBar.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable search input with optional filter button.
// Usage:
//   <SearchBar
//     value={query}
//     onChangeText={setQuery}
//     onSubmit={() => router.push('/search')}
//     onFilterPress={() => router.push('/filter')}
//   />
// ─────────────────────────────────────────────────────────────────────────────
import { MaterialIcons } from "@expo/vector-icons";
import React, { useRef } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  showFilter?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onFilterPress,
  placeholder = "Search job titles or companies",
  autoFocus = false,
  showFilter = true,
}: SearchBarProps) {
  const { colors } = useTheme();
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={styles.row}>
      {/* Input container */}
      <TouchableOpacity
        style={[
          styles.inputWrap,
          { backgroundColor: colors.bgCard, borderColor: colors.border },
        ]}
        onPress={() => inputRef.current?.focus()}
        activeOpacity={1}
      >
        <Text style={[styles.icon, { color: colors.textTertiary }]}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              onChangeText("");
              inputRef.current?.focus();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.clearIcon, { color: colors.textTertiary }]}>
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Filter button */}
      {showFilter && onFilterPress && (
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: colors.brandDark }]}
          onPress={onFilterPress}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name="filter-list"
            size={24}
            color={colors.tabIconSelected}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0, // fix Android vertical offset
    ...Platform.select({ android: { includeFontPadding: false } }),
  },
  clearIcon: {
    fontSize: 14,
    padding: 2,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  filterIcon: {
    fontSize: 20,
  },
});
