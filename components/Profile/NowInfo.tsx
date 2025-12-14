import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";
import { returnSeatTransaction } from "../../lib/seats";

function NowInfo() {
  const { user, setUser } = useUserContext();

  const [reservedSt, setReservedSt] = useState("00:00");
  const [reservedEd, setReservedEd] = useState("00:00");

  const [occupiedAtTS, setOccupiedAtTS] = useState<any>(null);

  const [seatStatus, setSeatStatus] = useState("none");
  const [seatLabel, setSeatLabel] = useState("-");

  const [startTimeText, setStartTimeText] = useState("00:00");
  const [studyTime, setStudyTime] = useState(0);

  /* --------------------------------------------------
   * Utils
   * -------------------------------------------------- */

  const formatTimeHHMM = (date: any) => {
    if (!date) return "00:00";
    const d = date.toDate ? date.toDate() : new Date(date);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  };

  const formatSeatLabel = (label: string) => {
    if (!label) return "-";
    const parts = label.split("-");
    if (parts.length < 2) return label;
    return `${parts[0].replace("제", "")} ${parts[1]}`;
  };

  /* --------------------------------------------------
   * Firestore seat 구독 (표시용)
   * -------------------------------------------------- */
  useEffect(() => {
    if (!user?.seatId) {
      setReservedSt("00:00");
      setReservedEd("00:00");
      setSeatStatus("none");
      setSeatLabel("-");
      setOccupiedAtTS(null);
      setStartTimeText("00:00");
      setStudyTime(0);
      return;
    }

    const unsub = firestore()
      .collection("seats")
      .doc(user.seatId)
      .onSnapshot((doc) => {
        if (!doc.exists) return;

        const data: any = doc.data();

        setReservedSt(data.reservedSt || "00:00");
        setReservedEd(data.reservedEd || "00:00");
        setSeatStatus(data.status);
        setSeatLabel(data.seatLabel || "-");
        setOccupiedAtTS(data.seatStudyStart ?? null);

        if (data.seatStudyStart) {
          setStartTimeText(formatTimeHHMM(data.seatStudyStart));
        } else {
          setStartTimeText("00:00");
        }
      });

    return () => unsub();
  }, [user?.seatId]);

  /* --------------------------------------------------
   * 공부시간 표시용 (연출, 10초)
   * -------------------------------------------------- */
  useEffect(() => {
    if (!occupiedAtTS) return;

    const interval = setInterval(() => {
      const now = Date.now() / 1000;
      const start = occupiedAtTS.toDate().getTime() / 1000;
      setStudyTime(Math.max(0, Math.floor(now - start)));
    }, 10000);

    return () => clearInterval(interval);
  }, [occupiedAtTS]);

  /* --------------------------------------------------
   * 좌석 반납 (lib 트랜잭션)
   * -------------------------------------------------- */
  const handleReturn = async () => {
    try {
      if (!user?.uid || !user?.seatId) return;

      await returnSeatTransaction({
        uid: user.uid,
        seatId: user.seatId,
        selectedSubject: user.selectedSubject,
      });

      // UI 상태 초기화
      setUser((prev) => ({ ...prev, seatId: null }));
      setReservedSt("00:00");
      setReservedEd("00:00");
      setSeatStatus("none");
      setSeatLabel("-");
      setOccupiedAtTS(null);
      setStartTimeText("00:00");
      setStudyTime(0);

      Alert.alert("반납 완료", "좌석이 성공적으로 반납되었습니다.");
    } catch (e) {
      console.log("❌ NowInfo Return ERROR:", e);
      Alert.alert("오류", "좌석 반납 중 문제가 발생했습니다.");
    }
  };

  /* --------------------------------------------------
   * UI
   * -------------------------------------------------- */
  return (
    <View style={styles.contentList}>
      {/* 예약좌석 */}
      <View style={styles.contentBox}>
        <Text style={styles.contentTitle}>예약좌석</Text>
        <View style={styles.rightGroup}>
          <Text style={styles.contentText}>
            {seatLabel !== "-" ? formatSeatLabel(seatLabel) : "-"}
          </Text>

          {user?.seatId && (
            <TouchableOpacity
              style={styles.returnButton}
              onPress={handleReturn}
            >
              <Text style={styles.returnButtonText}>반납</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 예약시간 */}
      <View style={styles.contentBox}>
        <Text style={styles.contentTitle}>예약시간</Text>
        <Text style={styles.contentText}>
          {reservedSt} ~ {reservedEd}
        </Text>
      </View>

      {/* 공부 시작 */}
      <View style={styles.contentBox}>
        <Text style={styles.contentTitle}>공부시작</Text>
        <Text style={styles.contentText}>{startTimeText}</Text>
      </View>
    </View>
  );
}

export default NowInfo;

const styles = StyleSheet.create({
  contentList: { flex: 1 },

  contentBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },

  contentTitle: { fontSize: 15, color: "#828282", marginLeft: 24 },
  contentText: { fontSize: 15, color: "#828282", marginRight: 24 },

  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  returnButton: {
    backgroundColor: "#005bac",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  returnButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
