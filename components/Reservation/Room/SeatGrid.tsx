// components/Reservation/Room/SeatGrid.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import SeatBox from "./SeatBox";

function SeatGrid({ seats, seatsPerRow, onSeatPress, seatColorFn }) {
    const seatRows = [];
    for (let i = 0; i < seats.length; i += seatsPerRow) {
        seatRows.push(seats.slice(i, i + seatsPerRow));
    }

    return (
        <View style={styles.seatContainer}>
            {seatRows.map((row, rowIdx) => (
                <View key={`row-${rowIdx}`} style={styles.seatRow}>
                {row.map((seat) => {
                    const isAvailable = seat.status === "none";  // ★ 핵심 규칙

                    const dynamicColor = seatColorFn ? seatColorFn(seat) : undefined;

                    return (
                    <SeatBox
                        key={seat.id}
                        seatNumber={seat.seat_number}
                        disabled={!isAvailable}         // ★ none일 때만 false
                        adminColor={dynamicColor}
                        onPress={
                            () => {
                                if (isAvailable) onSeatPress(seat);
                            }
                        }
                    />
                    );
                })}
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    seatContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#000",
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    seatRow: {
        flexDirection: "row",
        marginVertical: 5,
    },
});

export default SeatGrid;
