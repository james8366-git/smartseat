// AdminRoomScreen.tsx — FINAL (lib 반납 로직 통일)

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from "react-native";
import firestore from "@react-native-firebase/firestore";
import AdminSeatGrid from "../../components/Admin/Room/AdminSeatGrid";
import { returnSeatTransaction } from "../../lib/seats";

function AdminRoomScreen({ route }) {
  const { roomId, roomName } = route.params;

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  useEffect(() => {
    const unsub = firestore()
      .collection("seats")
      .where("room", "==", roomId)
      .onSnapshot((snap) => {
        const list = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => a.seat_number - b.seat_number);

        setSeats(list);
      });

    return () => unsub();
  }, [roomId]);

  const formatMinutesOnly = (ts) => {
    if (!ts) return "0분";
    const start = ts.toDate();
    const now = new Date();
    const diffSec = Math.floor((now - start) / 1000);
    return `${Math.floor(diffSec / 60)}분`;
  };

  const handleSeatPress = (seat) => {
    let statusText = "";
    let elapsedText = "";

    switch (seat.status) {
      case "empty":
        statusText = "자리 비움";
        elapsedText = formatMinutesOnly(seat.lastSeated);
        break;
      case "occupied":
        statusText = "착석 중";
        elapsedText = "-";
        break;
      case "anomaly":
        statusText = "이상 압력 감지";
        elapsedText = formatMinutesOnly(seat.anomalyAt);
        break;
      default:
        statusText = "상태 정보 없음";
        elapsedText = "-";
    }

    setSelectedSeat({ ...seat, statusText, elapsedText });
  };

  const handleReturn = async (seat) => {
    if (!seat) return;

    try {
      const studentNumber = seat.student_number;
      let userDoc = null;

      if (studentNumber) {
        const snap = await firestore()
          .collection("users")
          .where("student_number", "==", studentNumber)
          .get();

        if (!snap.empty) userDoc = snap.docs[0];
      }

      if (userDoc) {
        const userData = userDoc.data();

        await returnSeatTransaction({
          uid: userDoc.id,
          seatId: seat.id,
          selectedSubject: userData.selectedSubject,
        });
      } else {
        await firestore().collection("seats").doc(seat.id).update({
          status: "none",
          reservedSt: "",
          reservedEd: "",
          student_number: "",
          studylogId: "",
          isStudying: false,
          occupiedAt: null,
          lastFlushedAt: null,
          lastSeated: firestore.Timestamp.now(),
        });
      }

      Alert.alert("반납 완료", `${seat.seat_number}번 좌석이 반납되었습니다.`);
      setSelectedSeat(null);
    } catch (e) {
      console.log("관리자 좌석 반납 오류:", e);
      Alert.alert("오류", "반납 중 문제가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{roomName}</Text>

      <AdminSeatGrid
        seats={seats}
        seatsPerRow={6}
        isAdmin={true}
        seatColorFn={(seat) =>
          seat.status === "none" ? "#5A8DEE" : "#FF6B6B"
        }
        onSeatPress={handleSeatPress}
      />

      <Modal visible={!!selectedSeat} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{roomName}</Text>
            <Text style={styles.modalSeat}>
              {selectedSeat?.seat_number}번 좌석
            </Text>
            <Text style={styles.modalStatusText}>
              상태: {selectedSeat?.statusText}
            </Text>
            <Text style={styles.modalStatusText}>
              경과 시간: {selectedSeat?.elapsedText}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={() => handleReturn(selectedSeat)}
                style={[styles.modalButton, { marginRight: 10 }]}
              >
                <Text style={styles.modalButtonText}>반납</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedSeat(null)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default AdminRoomScreen;

/* styles 그대로 */


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 16 },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#5A8DEE",
    marginBottom: 12,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
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

  modalStatusText: {
    fontSize: 15,
    color: "#444",
    marginBottom: 20,
    textAlign: "center",
  },

  modalButton: {
    backgroundColor: "#5A8DEE",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  modalButtonText: { color: "white", fontWeight: "bold" },
});

export default AdminRoomScreen;
