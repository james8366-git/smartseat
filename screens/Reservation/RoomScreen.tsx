// screens/Reservation/RoomScreen.tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import firestore from "@react-native-firebase/firestore";

import SeatGrid from "../../components/Reservation/Room/SeatGrid";
import SeatModal from "../../components/Reservation/Room/SeatModal";

function RoomScreen({ route, navigation }) {
  const { roomId, roomName } = route.params;

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = firestore()
      .collection("seats")
      .where("room", "==", roomId)
      .onSnapshot((snapshot) => {
        const seatList = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => a.seat_number - b.seat_number);

        setSeats(seatList);
      });

    return () => unsubscribe();
  }, [roomId]);

  const handleSeatPress = (seat) => {
    console.log("⚡ 좌석 클릭:", seat.id);
    setSelectedSeat(seat);
    setModalVisible(true);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>{roomName}</Text>

        <SeatGrid
          seats={seats}
          seatsPerRow={6}
          onSeatPress={handleSeatPress}
        />
      </View>

      {/* 🔥 항상 렌더링 — Modal은 visible로만 제어해야 Navigation 위로 뜬다 */}
      <SeatModal
        visible={modalVisible}
        seat={selectedSeat}
        roomName={roomName}
        navigation={navigation}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}

export default RoomScreen;

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
