// ReturnSeat.tsx — FINAL
import React, { useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { finishAllSessions } from "../../lib/timer";

export default function ReturnSeat({ user, seatData }) {
  const uid = user?.uid;
  if (!uid) return null;

  const isFlushingRef = useRef(false);

  const handleReturn = async () => {
    if (!user?.seatId) return;

    const seatRef = firestore().collection("seats").doc(user.seatId);
    const userRef = firestore().collection("users").doc(uid);

    try {
      if (
        user.selectedSubject &&
        user.runningSubjectSince &&
        !isFlushingRef.current
      ) {
        isFlushingRef.current = true;

        await finishAllSessions({
          uid,
          selectedSubject: user.selectedSubject,
          runningSubjectSince: user.runningSubjectSince,
        });

        isFlushingRef.current = false;
      }

      await seatRef.update({
        status: "none",
        student_number: "",
        reservedSt: "",
        reservedEd: "",
        studylogId: "",
        isStudying: false,
        seatLabel: "",
        lastSeated: null,
        occupiedAt: null,
      });

      await userRef.update({
        seatId: null,
        runningSubjectSince: null,
      });

      Alert.alert("반납 완료", "좌석이 성공적으로 반납되었습니다.");
    } catch (e) {
      console.log("❌ ReturnSeat ERROR:", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>예약좌석:</Text>
      <Text style={styles.room}>
        {user?.seatId ? seatData?.seatLabel ?? user.seatId : "-"}
      </Text>

      {user?.seatId ? (
        <TouchableOpacity style={styles.btn} onPress={handleReturn}>
          <Text style={styles.btnText}>반납</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: "#f4f4f4",
    flexDirection: "row",
    alignItems: "center",
  },
  label: { fontSize: 16, fontWeight: "600" },
  room: { fontSize: 16, marginLeft: 12, flex: 1 },
  btn: {
    backgroundColor: "#5A8DEE",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
