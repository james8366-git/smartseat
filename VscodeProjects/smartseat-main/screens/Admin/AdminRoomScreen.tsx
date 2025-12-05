import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import firestore from "@react-native-firebase/firestore";
import SeatGrid from "../../components/Reservation/Room/SeatGrid";

function AdminRoomScreen({ route }) {
  const { roomId, roomName } = route.params;

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const [seatStatusText, setSeatStatusText] = useState("");
  const [elapsedMinutes, setElapsedMinutes] = useState(null);

  useEffect(() => {
    const unsub = firestore()
      .collection("seats")
      .where("room", "==", roomId)
      .onSnapshot((snap) => {
        const list = snap.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => a.seat_number - b.seat_number); // 🔥 번호 순 정렬

        setSeats(list);
      });

    return () => unsub();
  }, [roomId]);

  //시간 계산
  const calcMinutes = (timestamp) => {
    if (!timestamp) return null;

    const now = new Date();
    const t = timestamp.toDate();
    const diffMs = now - t;

    return Math.floor(diffMs / 60000);
  };

  //좌석 클릭
  const handleSeatPress = (seat) => {
    setSelectedSeat(seat);

    if (seat.status === "occupied") {
      setSeatStatusText("착석 중 입니다.");

    } else if (seat.status === "empty") {
      setSeatStatusText("자리 비움");
      setElapsedMinutes(calcMinutes(seat.lastSeated));

    } else if (seat.status === "object") {
      setSeatStatusText("이상 압력 감지");
      setElapsedMinutes(calcMinutes(seat.abnormalPressure));

    } else if (seat.status === "unauthorized") {
    setSeatStatusText("무단 점유");

    } else {
      setSeatStatusText("상태 정보 없음");
      setElapsedMinutes(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{roomName}</Text>

        <SeatGrid
        seats={seats}
        seatsPerRow={6}
        adminMode={true} 
        seatColorFn={(seat) => 
            seat.status === "empty" || seat.status === "object"
            ? "#FF6B6B"   // 빨간색
            : "#D9ECFF"   // 파란색
        }
        onSeatPress={handleSeatPress}
      />



      {/* Modal */}
      <Modal visible={!!selectedSeat} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{roomName}</Text>

            <Text style={styles.modalSeat}>
              {selectedSeat?.seat_number}번 좌석
            </Text>

            {/* 상태 메시지 표시 */}
            <Text style={styles.modalSeat}>상태: {seatStatusText}</Text>
           
            {elapsedMinutes !== null && (
              <Text style={styles.modalSeat}>경과 시간: {elapsedMinutes}분</Text>
            )}

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