import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function AdminSeatModal({
  visible,
  seat,
  roomName,
  onReturn,
  onClose,
}) {
  if (!seat) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{roomName}</Text>

          <Text style={styles.seatLabel}>
            {seat.seat_number}번 좌석
          </Text>

          <Text style={styles.statusText}>
            상태: {seat.statusText}
          </Text>

          <Text style={styles.statusText}>
            경과 시간: {seat.elapsedText}
          </Text>

          {/* 버튼 */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { marginRight: 10 }]}
              onPress={onReturn}
            >
              <Text style={styles.buttonText}>반납</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "70%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  seatLabel: { fontSize: 16, marginBottom: 10 },
  statusText: { fontSize: 15, marginBottom: 20, color: "#444" },
  buttonRow: { flexDirection: "row", marginTop: 10 },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#5A8DEE",
    borderRadius: 6,
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
