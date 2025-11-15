import React from 'react';
import { View, StyleSheet } from 'react-native';
import SeatBox from './SeatBox';

function SeatGrid({ seats, seatsPerRow, onSeatPress }) {
    const seatRows = [];

    for (let i = 0; i < seats.length; i += seatsPerRow) {
        seatRows.push(seats.slice(i, i + seatsPerRow));
    }

    return (
        <View style={styles.seatContainer}>
            {seatRows.map(
                (row, idx) => 
                    (
                        <View key={idx} style={styles.seatRow}>
                            {row.map
                                (seat => 
                                    (
                                        <SeatBox
                                            key={seat.id}
                                            seatNumber={seat.seat_number}
                                            onPress={onSeatPress}
                                        />
                                    )
                                )
                            }
                        </View>
                    )
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    seatContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#000',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    
    seatRow: {
        flexDirection: 'row',
        marginVertical: 5,
    },
});

export default SeatGrid;
