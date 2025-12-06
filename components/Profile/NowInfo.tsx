import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";
import { clearSeat } from "../../lib/users";
import { clearSeatStatus } from "../../lib/seats";

function NowInfo() {
  const { user, setUser } = useUserContext();

  const [seatLabel, setSeatLabel] = useState("-");
  const [reservedSt, setReservedSt] = useState("00:00");
  const [reservedEd, setReservedEd] = useState("00:00");

  const [studyStart, setStudyStart] = useState("00:00"); // ⭐ 공부 시작시간

  /** 좌석 정보 불러오기 */
  useEffect(() => {
    const loadSeat = async () => {
      if (!user?.seatId) return;

      const snap = await firestore().collection("seats").doc(user.seatId).get();
      if (!snap.exists){
        setSeatLabel("-");
        return;
      }

      const d = snap.data();
      setReservedSt(d.reservedSt ?? "00:00");
      setReservedEd(d.reservedEd ?? "00:00");
    };

    loadSeat();
  }, [user?.seatId]);

  /** ⭐ 공부 시작시간(lastOccupiedAt) 표시 */
  useEffect(() => {
    if (!user?.lastOccupiedAt) {
      setStudyStart("00:00");
      return;
    }

    const date = user.lastOccupiedAt.toDate();
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");

    setStudyStart(`${hh}:${mm}`);
  }, [user?.lastOccupiedAt]);

  /** 반납 */
  const handleReturn = async () => {
    try {
      if (user.seatId) {
        await clearSeatStatus(user.seatId); // seats/{seatId} 처리
      }
      await clearSeat(user.uid); // user.seatId 제거

      setUser((prev) => ({
        ...prev,
        seatId: "",
      }));

      setSeatLabel("-");
      setReservedSt("00:00");
      setReservedEd("00:00");

      Alert.alert("반납 완료", "좌석이 성공적으로 반납되었습니다.");
    } catch (e) {
      console.log("반납 오류:", e);
      Alert.alert("오류", "좌석 반납 중 문제가 발생했습니다.");
    }
  };

  return (
    <View style={styles.contentList}>

      {/* 예약좌석 */}
      <View style={styles.contentBox}>
        <Text style={styles.contentTitle}>예약좌석</Text>

        <View style={styles.rightGroup}>
          <Text style={styles.contentText}>{seatLabel}</Text>

          {user?.seatId ? (
            <TouchableOpacity style={styles.returnButton} onPress={handleReturn}>
              <Text style={styles.returnButtonText}>반납</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* 예약시간 */}
      <View style={styles.contentBox}>
        <Text style={styles.contentTitle}>예약시간</Text>
        <Text style={styles.contentText}>
          {reservedSt} ~ {reservedEd}
        </Text>
      </View>

      {/* ⭐ 공부시작시간 */}
      <View style={styles.contentBox}>
        <Text style={styles.contentTitle}>공부시작시간</Text>
        <Text style={styles.contentText}>{studyStart}</Text>
      </View>

      {/* 공부시간 (임시) */}
      <View style={styles.contentBox}>
        <Text style={styles.contentTitle}>공부시간</Text>
        <Text style={styles.contentText}>00:01</Text>
      </View>

      {/* 쉬는시간 (임시) */}
      <View style={styles.contentBox}>
        <Text style={styles.contentTitle}>쉬는시간</Text>
        <Text style={styles.contentText}>00:13</Text>
      </View>
    </View>
  );
}

export default NowInfo;

/* CSS 그대로 */
const styles = StyleSheet.create({
  contentList: { flex: 1 },

  contentBox:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },

  contentTitle: { fontSize: 15, color: '#828282', marginLeft: 24 },
  contentText: { fontSize: 15, color: '#828282', marginRight: 24 },

  rightGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  returnButton: {
    backgroundColor: '#005bac',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  returnButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
