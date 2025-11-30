// components/HomeScreen/ReturnSeat.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";
import { flushSubject } from "../../lib/timer";

export default function ReturnSeat({
  user,
  subjects,
  subjectTimes,
  seatStatus,
  seatData,
}) {
  const { setUser } = useUserContext();
  const [visible, setVisible] = useState(false);

  const seatLabel = user?.seatId
    ? seatData?.seatLabel || user.seatId.replace(/_/g, " ")
    : "-";

  const current = subjects.find((s) => s.name === user.selectedSubject);
  const currentId = current?.id ?? null;

  const handleReturn = async () => {
    if (!user.seatId) return;
    const uid = user.uid;

    // 1) 착석 상태였다면 마지막 세션 flush
    if (seatStatus === "occupied" && user.runningSubjectSince && currentId) {
      await flushSubject({
        uid,
        subjectId: currentId,
        runningSubjectSince: user.runningSubjectSince,
      });
    }

    // 2) runningSubjectSince 종료
    await firestore().collection("users").doc(uid).update({
      runningSubjectSince: null,
    });

    // 3) 좌석 문서 초기화
    await firestore().collection("seats").doc(user.seatId).update({
      status: "none",
      reservedSt: "",
      reservedEd: "",
      student_number: "",
      isStudying: false,
    });

    // 4) user.seatId 제거
    await firestore().collection("users").doc(uid).update({
      seatId: "",
    });

    // 5) local user 상태도 동기화
    setUser((prev) => ({ ...prev, seatId: "", runningSubjectSince: null }));

    setVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>예약좌석: {seatLabel}</Text>

        {user?.seatId && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setVisible(true)}
          >
            <Text style={styles.btnText}>반납</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalMsg}>좌석을 반납하시겠습니까?</Text>

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.mbtn, { backgroundColor: "#ccc" }]}
                onPress={() => setVisible(false)}
              >
                <Text>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.mbtn, { backgroundColor: "#5A8DEE" }]}
                onPress={handleReturn}
              >
                <Text style={{ color: "#fff" }}>반납</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#5A8DEE",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  btnText: { color: "#fff", fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalBox: {
    width: "75%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
  },
  modalMsg: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },

  row: { flexDirection: "row" },
  mbtn: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
    borderRadius: 8,
  },
});
