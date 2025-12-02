// ReturnSeat.tsx — FULL FINAL with Confirm

import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { finishAllSessions } from "../../lib/timer";

export default function ReturnSeat({ user, seatData }) {
  const uid = user?.uid;
  const isFlushingRef = useRef(false);

  /* ---------------------------------------------------
   * 실제 반납 처리 (Confirm 이후 실행)
   * --------------------------------------------------- */
  const reallyReturn = async () => {
    if (!user?.seatId) return;

    const seatRef = firestore().collection("seats").doc(user.seatId);
    const userRef = firestore().collection("users").doc(user.uid);

    try {
      // 즉시 타이머 정지
      await userRef.update({
        runningSubjectSince: null,
      });

      // flush
      if (user.selectedSubject && user.runningSubjectSince && !isFlushingRef.current) {
        isFlushingRef.current = true;

        await finishAllSessions({
          uid,
          selectedSubject: user.selectedSubject,
          runningSubjectSince: user.runningSubjectSince,
        });

        isFlushingRef.current = false;
      }

      // 좌석 초기화
      await seatRef.update({
        status: "none",
        reservedSt: "",
        reservedEd: "",
        student_number: "",
        studylogId: "",
        isStudying: false,
        occupiedAt: null,
        lastSeated: null,
      });

      // user 초기화
      await userRef.update({
        seatId: null,
        runningSubjectSince: null,
      });

      Alert.alert("반납 완료", "좌석이 정상적으로 반납되었습니다.");
    } catch (e) {
      console.log("❌ ReturnSeat ERROR:", e);
      Alert.alert("에러", "반납 처리 중 문제가 발생했습니다.");
    }
  };

  /* ---------------------------------------------------
   * Confirm 알람
   * --------------------------------------------------- */
  const handleReturn = () => {
    Alert.alert(
      "좌석 반납",
      "정말 좌석을 반납하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "반납", style: "destructive", onPress: reallyReturn }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>예약좌석:</Text>
      <Text style={styles.room}>
        {user?.seatId ? seatData?.seatLabel ?? user.seatId : "-"}
      </Text>

      {user?.seatId && (
        <TouchableOpacity style={styles.btn} onPress={handleReturn}>
          <Text style={styles.btnText}>반납</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#f4f4f4",
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  label: { fontSize: 16, fontWeight: "600" },
  room: { marginLeft: 12, fontSize: 16, flex: 1 },
  btn: {
    backgroundColor: "#5A8DEE",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
