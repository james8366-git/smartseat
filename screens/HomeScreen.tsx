// HomeScreen.tsx — FINAL v7 (10초 자동 flush 포함)

import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  /* ---------------------------------------------------
   * USER SNAPSHOT
   * --------------------------------------------------- */
  useEffect(() => {
    if (!user?.uid) return;

    return firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((snap) => {
        if (!snap.exists) return;
        const data = snap.data();

        // 선택 과목 없으면 base로 교정
        if (!data.selectedSubject || !data.subject?.[data.selectedSubject]) {
          firestore()
            .collection("users")
            .doc(user.uid)
            .update({
              selectedSubject: "base",
            });
        }

        setUser((prev) => ({ ...prev, ...data }));
      });
  }, [user?.uid]);

  /* ---------------------------------------------------
   * SEAT SNAPSHOT
   * --------------------------------------------------- */
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

      // 좌석 떠날 때 flush
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

  /* ---------------------------------------------------
   * APP STATE FLUSH (백그라운드 이동)
   * --------------------------------------------------- */
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (
        nextState.match(/inactive|background/) &&
        appState.current === "active"
      ) {
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
    });

    return () => subscription.remove();
  }, [seatStatus, user.runningSubjectSince, user.selectedSubject]);

  /* ---------------------------------------------------
   * ⭐ 10초마다 자동 flush → RankScreen 실시간 반영
   * --------------------------------------------------- */
  useEffect(() => {
    if (!user?.uid || seatStatus !== "occupied" || !user.runningSubjectSince)
      return;

    const interval = setInterval(async () => {
      if (isFlushingRef.current) return;

      isFlushingRef.current = true;

      // 1) flush
      await finishAllSessions({
        uid: user.uid,
        selectedSubject: user.selectedSubject,
        runningSubjectSince: user.runningSubjectSince,
      });

      // 2) flush 후 즉시 runningSubjectSince 재시작 (UI 끊김 방지)
      await firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          runningSubjectSince: firestore.Timestamp.now(),
        });

      isFlushingRef.current = false;
    }, 10000); // 🔥 10초마다 실행

    return () => clearInterval(interval);
  }, [seatStatus, user?.runningSubjectSince, user?.selectedSubject]);

  /* ---------------------------------------------------
   * STATUS TEXT
   * --------------------------------------------------- */
  const statusText = {
    none: "",
    empty: "미착석",
    occupied: "공부중!",
    object: "물건!",
  }[seatStatus];

  /* ---------------------------------------------------
   * RENDER
   * --------------------------------------------------- */
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{statusText}</Text>
      </View>

      <TodayTimer uiTime={todayUiTime} />
      <ReturnSeat user={user} seatData={seatData} />
      <StudyList subjectTimes={subjectTimes} seatStatus={seatStatus} />
    </SafeAreaView>
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
