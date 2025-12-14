// PlaceScreen — SAFEAREA 적용 버전 (CSS 변경 없음)
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabBar from '../../components/Reservation/Place/TabBar';
import RoomList from '../../components/Reservation/Place/RoomList';

function PlaceScreen({ navigation }) {
    const [selectedTab, setSelectedTab] = useState('reading_room');

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <TabBar selectedTab={selectedTab} onSelect={setSelectedTab} />

            <View style={styles.separator} />

            <RoomList selectedTab={selectedTab} navigation={navigation} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#FFFFFF' 
    },
    separator: { 
        height: 1, 
        backgroundColor: '#DADADA' 
    },
});

export default PlaceScreen;
