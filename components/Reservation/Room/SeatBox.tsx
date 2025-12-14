// components/Reservation/Room/SeatBox.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

function SeatBox({ seatNumber, disabled, onPress, adminColor }) {

    const backgroundColor = adminColor
        ? adminColor                              
        : disabled
        ? "#CCCCCC"                                
        : "#E3EBFF";                               

    return (
        <TouchableOpacity
            style={[
                styles.seat,
                { backgroundColor }                    
            ]}
        onPress={disabled ? undefined : onPress}
        activeOpacity={disabled ? 1 : 0.6}
        >
            <Text style={styles.seatText}>{seatNumber}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    seat: {
        width: 40,
        height: 40,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 5,
    },

    seatAvailable: {
        backgroundColor: "#E3EBFF",
        borderWidth: 2,
        borderColor: "#5A8DEE",
    },

    seatDisabled: {
        backgroundColor: "#CCCCCC",
        borderWidth: 2,
        borderColor: "#999999",
    },

    seatText: {
        fontSize: 14,
        color: "#333",
    },
});

export default SeatBox;
