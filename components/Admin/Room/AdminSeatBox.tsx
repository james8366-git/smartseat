import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function AdminSeatBox({ seatNumber, adminColor, onPress }) {

  return (
    <TouchableOpacity
      style={[styles.seat, { backgroundColor: adminColor }]}
      onPress={onPress}
      activeOpacity={0.7}
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
  seatText: {
    fontSize: 14,
    color: "#000",
  },
});
