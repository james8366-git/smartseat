// RoomScreen — SAFEAREA + MODAL STABILITY (완전체)

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

    const unsub = firestore()
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

    return () => unsub();
  }, [roomId]);

  const handleSeatPress = (seat) => {
    setSelectedSeat(seat);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={["top"]}>
      
      {/* 화면 본문 */}
      <View style={styles.container}>
        <Text style={styles.title}>{roomName}</Text>
        
        <SeatGrid
          seats={seats}
          seatsPerRow={6}
          onSeatPress={handleSeatPress}
        />
      </View>

      {/* 항상 렌더링되는 Modal → SafeAreaView sibling이 가장 안전함 */}
      <SeatModal
        visible={modalVisible}
        seat={selectedSeat}
        roomName={roomName}
        navigation={navigation}
        onClose={() => setModalVisible(false)}
      />

    </SafeAreaView>
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
