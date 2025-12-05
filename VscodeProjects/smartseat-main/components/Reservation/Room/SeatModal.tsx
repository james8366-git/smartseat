// components/Reservation/Room/SeatModal.tsx

import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { useUserContext } from "../../../contexts/UserContext";
import { reserveSeat } from "../../../lib/seats";
import firestore from "@react-native-firebase/firestore";

function SeatModal({ visible, onClose, seat, roomName, navigation }) {
  const { user } = useUserContext();

  if (!seat) return null;

  // 🔥 selectedSubject = 과목 id(uuid)
  const selectedSubjectId = user?.selectedSubject ?? null;

  const seatLabel = `${roomName} ${seat.seat_number}번`;

  const handleReserve = async () => {
    if (!user) {
      Alert.alert("오류", "로그인 정보가 없습니다.");
      return;
    }

    // 🔥 이제 id 기반으로 체크
    if (!selectedSubjectId) {
      Alert.alert("오류", "먼저 홈 화면에서 과목을 선택해주세요.");
      return;
    }

    if (user.seatId && user.seatId !== "") {
      Alert.alert("이미 자리를 예약하셨습니다.");
      return;
    }

    try {
      const latestSnap = await firestore()
        .collection("seats")
        .doc(seat.id)
        .get();

      if (!latestSnap.exists) {
        Alert.alert("오류", "좌석 정보가 존재하지 않습니다.");
        return;
      }

      const latest = latestSnap.data();

      if (latest.status !== "none") {
        Alert.alert("오류", "이미 예약된 좌석입니다.");
        return;
      }

      /* 예약 트랜잭션 */
      await reserveSeat({
        seatDocId: seat.id,
        roomId: seat.room,
        seatNumber: seat.seat_number,
        user: {
          uid: user.uid,
          student_number: user.student_number,
          selectedSubject: selectedSubjectId, // ✔ id 기반으로 전달
        },
      });

      Alert.alert("예약 완료", "좌석 예약이 완료되었습니다.");

      onClose();
      navigation.navigate("HomeStack", { screen: "Home" });
    } catch (e: any) {
      console.log("Reserve ERROR:", e);

      if (e.message === "SEAT_ALREADY_RESERVED") {
        Alert.alert("오류", "이미 선점된 자리입니다.");
      } else if (e.message === "USER_ALREADY_HAS_SEAT") {
        Alert.alert("오류", "이미 자리를 예약하셨습니다.");
      } else if (e.message === "NO_SEAT") {
        Alert.alert("오류", "해당 좌석이 존재하지 않습니다.");
      } else {
        Alert.alert("오류", "예약 중 문제가 발생했습니다.");
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>좌석예약</Text>
          <Text style={styles.label}>{seatLabel}</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={handleReserve}>
              <Text style={styles.btnText}>예약</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#999" }]}
              onPress={onClose}
            >
              <Text style={styles.btnText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default SeatModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  box: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
  title: { fontSize: 18, marginBottom: 10, fontWeight: "600" },
  label: { fontSize: 16, marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-evenly", marginTop: 10 },
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#5A8DEE",
    width: "40%",
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold" },
});
