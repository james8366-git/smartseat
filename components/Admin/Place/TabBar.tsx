import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function AdminTabBar({ selectedTab, onSelect }) {
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.item, selectedTab === 'reading_room' && styles.active]}
        onPress={() => onSelect('reading_room')}
      >
        <Text
          style={[styles.text, selectedTab === 'reading_room' && styles.activeText]}
        >
          일반열람실
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: '20%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  item: { marginRight: 16, paddingBottom: 6 },
  text: { fontSize: 16, color: '#666' },
  active: { borderBottomWidth: 2, borderBottomColor: '#5A8DEE' },
  activeText: { color: '#5A8DEE', fontWeight: 'bold' },
});
