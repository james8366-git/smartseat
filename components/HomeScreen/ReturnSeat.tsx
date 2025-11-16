// components/HomeScreen/ReturnSeat.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useUserContext } from '../../contexts/UserContext';
import firestore from '@react-native-firebase/firestore';
import { clearSeat } from '../../lib/users';
import { clearSeatStatus } from '../../lib/seats';

function ReturnSeat({ seat = "" }) {
  const { user, setUser } = useUserContext();
  const [modalVisible, setModalVisible] = useState(false);

  const hasSeat = !!seat;

      const roomMap: any = {
        "제1열람실": "11",
        "제2-1열람실": "21",
        "제2-2열람실": "22",
        "제2-2열람실(대학원생전용)": "23",
    };

  // seatId = "제1열람실-2번"
    const findSeatDocId = async (seatLabel: string) => {
    if (!seatLabel) return null;

    // 🔥 모든 공백을 기준으로 split
    const parts = seatLabel.trim().split(/\s+/); // ["제1열람실", "1번"]

    if (parts.length < 2) return null;

    const roomName = parts[0];   // "제1열람실"
    const seatPart = parts[1];   // "1번"

    if (!seatPart.includes("번")) return null;

    const seatNum = parseInt(seatPart.replace("번", ""), 10);

    if (isNaN(seatNum)) return null;

    const roomId = roomMap[roomName];
    if (!roomId) return null;

    const snap = await firestore()
        .collection("seats")
        .where("room", "==", roomId)
        .where("seat_number", "==", seatNum)
        .limit(1)
        .get();

    return snap.empty ? null : snap.docs[0].id;
    };

    const handleReturn = async () => {
    try {
        // seatId 먼저 저장 (clearSeat 전에 날아가기 때문)
        const seatLabel = user.seatId;
        console.log(user.seatId);

        if (!seatLabel) {
        Alert.alert("오류", "현재 예약된 좌석이 없습니다.");
        return;
        }

        // 1) 좌석 문서 ID 먼저 찾기
        const seatDocId = await findSeatDocId(seatLabel);

        // 2) seats 상태 초기화
        if (seatDocId) {
        await clearSeatStatus(seatDocId);  // status: none 등
        }

        // 3) user 의 seatId 초기화 (rules 통과)
        await clearSeat(user.uid);

        // 4) context 업데이트
        setUser(prev => ({
        ...prev,
        seatId: "",
        }));

        // 5) 모달 닫기
        setModalVisible(false);

        Alert.alert("반납 완료", "좌석이 성공적으로 반납되었습니다.");

    } catch (e) {
        console.log("❌ 반납 오류:", e);
        setModalVisible(false);
        Alert.alert("오류", "좌석 반납 중 문제가 발생했습니다.");
    }
    };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.reserveText}>
          예약좌석: {hasSeat ? seat : ""}
        </Text>

        <TouchableOpacity
          style={[styles.returnButton, !hasSeat && { opacity: 0 }]}
          disabled={!hasSeat}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.returnText}>반납</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>좌석을 반납하시겠습니까?</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#5A8DEE" }]}
                onPress={handleReturn}
              >
                <Text style={{ color: "white" }}>반납</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default ReturnSeat;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA'
  },
  reserveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  returnButton: {
    backgroundColor: '#5A8DEE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  returnText: {
    color: 'white',
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center"
  },
  modalBox: {
    backgroundColor: "white",
    width: "75%",
    borderRadius: 12,
    padding: 20
  },
  modalText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center"
  }
});
