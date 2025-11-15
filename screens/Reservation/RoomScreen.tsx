// screens/Reservation/RoomScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import SeatGrid from "../../components/Reservation/Room/SeatGrid";
import SeatModal from "../../components/Reservation/Room/SeatModal";
import { getSeatsByRoom } from "../../lib/seats";

function RoomScreen({ route, navigation }) {
  const { roomId, roomName } = route.params;

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    async function loadSeats() {
      if (!roomId) return;

      const seatData = await getSeatsByRoom(roomId);

      const formatted = seatData.map((s) => ({
        id: s.seatId,               // 🔥 반드시 문서 id
        seat_number: s.seat_number,
        status: s.status,
        student_number: s.student_number,
        room: s.room,
      }));

      setSeats(formatted);
    }

    loadSeats();
  }, [roomId]);

  const handleSeatPress = (seat) => {
    if (seat.status !== "none") return;
    setSelectedSeat(seat);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{roomName}</Text>

      <SeatGrid
        seats={seats}
        seatsPerRow={6}
        onSeatPress={handleSeatPress}
      />

      <SeatModal
        visible={modalVisible}
        seat={selectedSeat}
        roomName={roomName}
        navigation={navigation}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5A8DEE",
    marginBottom: 10,
  },
});

export default RoomScreen;
