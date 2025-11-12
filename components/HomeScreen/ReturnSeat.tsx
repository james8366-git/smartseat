import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

function ReturnSeat({ seat = '1-256' }) {
    const seatReturn = () => {
        Alert.alert('반납 완료', '좌석을 반납했습니다.');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.reserveText}>
                예약좌석: {seat}
            </Text>
            <TouchableOpacity style={styles.returnButton} onPress={seatReturn}>
                <Text style={styles.returnText}>
                    반납
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    reserveText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    returnButton: {
        backgroundColor: '#005bac',
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 6,
    },
    returnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ReturnSeat;
