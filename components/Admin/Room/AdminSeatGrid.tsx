import React from "react";
import { View, StyleSheet } from "react-native";
import AdminSeatBox from "./AdminSeatBox";

export default function AdminSeatGrid({
  seats,
  seatsPerRow,
  onSeatPress,
}) {
  const seatRows = [];
  for (let i = 0; i < seats.length; i += seatsPerRow) {
    seatRows.push(seats.slice(i, i + seatsPerRow));
  }

  return (
    <View style={styles.seatContainer}>
      {seatRows.map((row, rowIdx) => (
        <View key={`row-${rowIdx}`} style={styles.seatRow}>
          {row.map((seat) => (
            <AdminSeatBox
              key={seat.id}
              seatNumber={seat.seat_number}
              status={seat.status}
              onPress={() => {
                console.log("Pressed Seat:", seat);
                onSeatPress(seat);
                }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  seatContainer: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  seatRow: {
    flexDirection: "row",
    marginVertical: 5,
  },
});
