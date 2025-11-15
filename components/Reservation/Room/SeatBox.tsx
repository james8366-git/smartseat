// components/Reservation/Room/SeatBox.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

function SeatBox({
  seatNumber,
  disabled,
  onPress,
}: {
  seatNumber: number;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.seat,
        disabled ? styles.seatDisabled : styles.seatAvailable,
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
    backgroundColor: "#E3EBFF", // 파란계열
    borderWidth: 2,
    borderColor: "#5A8DEE",
  },

  seatDisabled: {
    backgroundColor: "#CCCCCC", // 회색
    borderWidth: 2,
    borderColor: "#999999",
  },

  seatText: {
    fontSize: 14,
    color: "#333",
  },
});

export default SeatBox;
