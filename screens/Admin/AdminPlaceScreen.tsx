import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabBar from '../../components/Reservation/Place/TabBar';
import AdminRoomList from '../../components/Admin/Place/AdminRoomList';

function AdminPlaceScreen({ navigation }) {
  const [selectedTab, setSelectedTab] = useState('reading_room');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TabBar selectedTab={selectedTab} onSelect={setSelectedTab} />

        <View style={styles.separator} />

      <AdminRoomList selectedTab={selectedTab} navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  separator: { height: 1, backgroundColor: '#DADADA' },
});

export default AdminPlaceScreen;