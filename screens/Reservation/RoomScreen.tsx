// screens/Reservation/RoomScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import SeatGrid from "../../components/Reservation/Room/SeatGrid";
import SeatModal from "../../components/Reservation/Room/SeatModal";
import firestore from '@react-native-firebase/firestore';

function RoomScreen({ route, navigation }) {
  const { roomId, roomName } = route.params;

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  /* ------------------------------------------------
   * 🔵 좌석 실시간 구독
   * ------------------------------------------------ */
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = firestore()
      .collection("seats")
      .where("room", "==", roomId)
      .onSnapshot(snapshot => {
        const seatList = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => a.seat_number - b.seat_number);

        setSeats(seatList);
      });

    return () => unsubscribe();
  }, [roomId]);

  /* ------------------------------------------------
   * 🔵 좌석 클릭 처리
   *    ❗ RoomScreen에서는 좌석 상태를 막지 않는다.
   *    (SeatModal에서 최신 상태 검증함)
   * ------------------------------------------------ */
  const handleSeatPress = (seat) => {
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

export default RoomScreen;

/* 🔥 CSS 그대로 유지 */
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
