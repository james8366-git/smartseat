import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import firestore from "@react-native-firebase/firestore";

function AdminRoomScreen({ route }) {
  const { roomId, roomName } = route.params;

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    const unsub = firestore()
      .collection("seats")
      .where("room", "==", roomId)
      .onSnapshot((snap) => {
        const list = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSeats(list);
      });

    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{roomName}</Text>

      <View style={styles.grid}>
        {seats.map((seat) => (
          <TouchableOpacity
            key={seat.id}
            style={[
              styles.seatBox,
              ["empty", "object"].includes(seat.status)
                ? styles.red
                : styles.blue,
            ]}
            onPress={() => setSelectedSeat(seat)}
          >
            <Text style={styles.seatNumber}>{seat.seat_number}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal */}
      <Modal visible={!!selectedSeat} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{roomName}</Text>
            <Text style={styles.modalSeat}>
              {selectedSeat?.seat_number}번 좌석
            </Text>

            <Text style={styles.modalSeat}>
              상태: {selectedSeat?.status}
            </Text>

            <TouchableOpacity
              onPress={() => setSelectedSeat(null)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 16 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5A8DEE",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
    height: "85%",
  },
  seatBox: {
    width: 32,
    height: 32,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  blue: { backgroundColor: "#D9ECFF" },
  red: { backgroundColor: "#FF8A8A" },
  seatNumber: { fontSize: 14, fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "70%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalSeat: { fontSize: 16, marginBottom: 10 },
  closeBtn: {
    backgroundColor: "#5A8DEE",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  closeText: { color: "white", fontWeight: "bold" },
});

export default AdminRoomScreen;
