// screens/HomeScreen.tsx — FINAL STABLE VERSION

import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet } from "react-native";

import TodayTimer from "../components/HomeScreen/TodayTimer";
import StudyList from "../components/HomeScreen/StudyList";
import ReturnSeat from "../components/HomeScreen/ReturnSeat";

import { useUserContext } from "../contexts/UserContext";
import firestore from "@react-native-firebase/firestore";

import { useStudyTimer } from "../components/HomeScreen/useStudyTimer";
import { finishAllSessions } from "../lib/timer";

export default function HomeScreen() {
  const { user, setUser } = useUserContext();
  const [seatData, setSeatData] = useState(null);

  const { todayUiTime, subjectTimes, seatStatus } = useStudyTimer();

  const isFlushingRef = useRef(false);

  /* --------------------------------------------------------
   * USER SNAPSHOT (subject 포함 필수!)
   * -------------------------------------------------------- */
  useEffect(() => {
    if (!user?.uid) return;

    return firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((snap) => {
        if (!snap.exists) return;
        const data = snap.data();
        setUser((prev) => ({ ...prev, ...data }));
      });
  }, [user?.uid]);

  /* --------------------------------------------------------
   * SEAT SNAPSHOT → flush 감지
   * -------------------------------------------------------- */
  useEffect(() => {
    if (!user?.seatId) {
      setSeatData(null);
      return;
    }

    const seatRef = firestore().collection("seats").doc(user.seatId);
    let prevStatus = "empty";

    return seatRef.onSnapshot(async (snap) => {
      if (!snap.exists) return;
      const data = snap.data();
      setSeatData(data);

      const now = data.status;
      const leaving = prevStatus === "occupied" && now !== "occupied";

      if (leaving && !isFlushingRef.current) {
        isFlushingRef.current = true;

        if (user.selectedSubject && user.runningSubjectSince) {
          await finishAllSessions({
            uid: user.uid,
            selectedSubject: user.selectedSubject,
            runningSubjectSince: user.runningSubjectSince,
          });
        }

        isFlushingRef.current = false;
      }

      prevStatus = now;
    });
  }, [user?.seatId, user?.selectedSubject, user?.runningSubjectSince]);

  return (
    <View style={styles.container}>
      <TodayTimer uiTime={todayUiTime} />
      <ReturnSeat user={user} seatData={seatData} />
      <StudyList subjectTimes={subjectTimes} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
