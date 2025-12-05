// HomeScreen.tsx — FINAL v5 + AppState FLUSH EDITION

import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, AppState } from "react-native";

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
  const appState = useRef(AppState.currentState);

  const { todayUiTime, subjectTimes, seatStatus } = useStudyTimer();
  const isFlushingRef = useRef(false);

  /* USER SNAPSHOT */
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

  /* SEAT SNAPSHOT */
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
      const leaving =
        prevStatus === "occupied" && now !== "occupied";

      // 좌석 이탈 -> flush
      if (leaving && !isFlushingRef.current && user.runningSubjectSince) {
        isFlushingRef.current = true;

        await finishAllSessions({
          uid: user.uid,
          selectedSubject: user.selectedSubject,
          runningSubjectSince: user.runningSubjectSince,
        });

        isFlushingRef.current = false;
      }

      prevStatus = now;
    });
  }, [user?.seatId, user?.runningSubjectSince, user?.selectedSubject]);

  /* -------------------------------------------------------
   *  APP STATE (🔥 핵심)
   *  앱이 background 또는 quit 될 때 자동 flush
   * ------------------------------------------------------- */
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (
          nextState.match(/inactive|background/) &&
          appState.current === "active"
        ) {
          // 앱이 종료되기 직전에 flush
          if (
            seatStatus === "occupied" &&
            user.runningSubjectSince &&
            !isFlushingRef.current
          ) {
            isFlushingRef.current = true;

            await finishAllSessions({
              uid: user.uid,
              selectedSubject: user.selectedSubject,
              runningSubjectSince: user.runningSubjectSince,
            });

            isFlushingRef.current = false;
          }
        }

        appState.current = nextState;
      }
    );

    return () => subscription.remove();
  }, [seatStatus, user.runningSubjectSince, user.selectedSubject]);

  /* STATUS TEXT */
  const statusText = {
    none: "",
    empty: "미착석",
    occupied: "공부중!",
    object: "물건!",
  }[seatStatus];

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      <TodayTimer uiTime={todayUiTime} />
      <ReturnSeat user={user} seatData={seatData} />

      <StudyList subjectTimes={subjectTimes} seatStatus={seatStatus} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  statusBar: {
    padding: 10,
    alignItems: "center",
    backgroundColor: "#eef4ff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
