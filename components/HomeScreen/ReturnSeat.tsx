// components/HomeScreen/ReturnSeat.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
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
    "제2-2열람실 (대학원생 전용)": "23",
  };

  // seatId = "제1열람실-2번"
  const findSeatDocId = async (seatLabel: string) => {
    const [roomName, numStr] = seatLabel.split('-');
    const roomId = roomMap[roomName];
    const seatNum = parseInt(numStr.replace("번", ""), 10);

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
      // 1) 사용자 seatId 초기화
      await clearSeat(user.uid); 

      // 2) 실제 좌석 문서ID 찾기
      const seatDocId = await findSeatDocId(user.seatId);

      if (seatDocId) {
        await clearSeatStatus(seatDocId);   // 🔥 좌석 상태 초기화
      }

      // 3) userContext 업데이트
      setUser((prev: any) => ({
        ...prev,
        seatId: ""
      }));

      setModalVisible(false);   // 🔥 제대로 닫힘
    } catch (e) {
      console.log("❌ 반납 오류:", e);
      setModalVisible(false);  // 오류나도 닫히게
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
