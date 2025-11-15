import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

function SeatBox({ seatNumber, onPress }) {
    return (
        <TouchableOpacity style={styles.seat} onPress={() => onPress(seatNumber)}>
            <Text style={styles.seatText}>{seatNumber}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    seat: {
        width: 30,
        height: 30,
        backgroundColor: '#E3EBFF',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
    },
    
    seatText: {
        fontSize: 12,
        color: '#333',
    },
});

export default SeatBox;
