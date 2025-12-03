import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, AppState } from "react-native";

import TodayTimer from "../components/HomeScreen/TodayTimer";
import StudyList from "../components/HomeScreen/StudyList";
import ReturnSeat from "../components/HomeScreen/ReturnSeat";

import { useUserContext } from "../contexts/UserContext";
import firestore from "@react-native-firebase/firestore";

import { useStudyTimer } from "../components/HomeScreen/useStudyTimer";;
import  { finishAllSessions }  from "../lib/timer";

export default function HomeScreen() {
  const { user, setUser } = useUserContext();
  const [seatData, setSeatData] = useState(null);
  const appState = useRef(AppState.currentState);

  const { todayUiTime, subjectTimes, seatStatus } = useStudyTimer();

  /** 🔵 실시간 todayUiTime 추적 */
  const todayUiTimeRef = useRef(0);
  useEffect(() => {
    todayUiTimeRef.current = todayUiTime;
  }, [todayUiTime]);

  /** 🔵 DB와 diff 계산 기준값 */
  const lastSyncedUiTimeRef = useRef(0);

  const isFlushingRef = useRef(false);

  /* ------------------------------------------
   * USER SNAPSHOT
   * 앱 재실행 시 todayUiTime을 DB 값으로 초기화 (중복 증가 완전 제거)
   * ------------------------------------------*/
  useEffect(() => {
    if (!user?.uid) return;

    return firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((snap) => {
        if (!snap.exists) return;
        const data = snap.data();

        /** ⭐ 앱 재실행 시 UI 타이머 초기화 */
        if (typeof data.todayTotalTime === "number") {
          todayUiTimeRef.current = data.todayTotalTime;
          lastSyncedUiTimeRef.current = data.todayTotalTime;
        }

        setUser((prev) => ({ ...prev, ...data }));
      });
  }, [user?.uid]);

  /* ------------------------------------------
   * todayUiTime → todayTotalTime (10초 증가 시 DB 반영)
   * ❗ user?.uid 제거 → 중복 증가 완전 방지
   * ------------------------------------------*/
  useEffect(() => {
    if (!user?.uid) return;

    const current = todayUiTimeRef.current;
    const prev = lastSyncedUiTimeRef.current;

    if (current <= prev) return;

    const diff = current - prev;
    if (diff < 10) return; // 10초 단위 업데이트

    const applyIncrement = async () => {
      try {
        await firestore()
          .collection("users")
          .doc(user.uid)
          .update({
            todayTotalTime: firestore.FieldValue.increment(diff),
          });

        lastSyncedUiTimeRef.current = current;
      } catch (e) {
        console.log("todayTotalTime sync error:", e);
      }
    };

    applyIncrement();
  }, [todayUiTime]); // <<<<<<<< 🔥 user.uid 제거

  /* ------------------------------------------
   * SEAT SNAPSHOT
   * 좌석 이탈 시 flush + finishAllSessions 실행
   * ------------------------------------------*/
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

      if (leaving && !isFlushingRef.current && user.runningSubjectSince) {
        isFlushingRef.current = true;

        try {
          /** 🔥 DB에 반영되지 않은 diff 반영 */
          const current = todayUiTimeRef.current;
          const prev = lastSyncedUiTimeRef.current;
          const diff = current - prev;

          if (diff > 0) {
            await firestore()
              .collection("users")
              .doc(user.uid)
              .update({
                todayTotalTime: firestore.FieldValue.increment(diff),
              });
            lastSyncedUiTimeRef.current = current;
          }
        } catch (e) {
          console.log("flush on seat leaving error:", e);
        }

        await finishAllSessions({
          uid: user.uid,
          selectedSubject: user.selectedSubject,
          runningSubjectSince: user.runningSubjectSince,
          seatId: user.seatId,
          student_number: user.student_number,
        });

        isFlushingRef.current = false;
      }

      prevStatus = now;
    });
  }, [
    user?.seatId,
    user?.runningSubjectSince,
    user?.selectedSubject,
  ]);

  /* ------------------------------------------
   * APP STATE
   * 앱 종료/백그라운드 진입 시 강제 flush
   * ------------------------------------------*/
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
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

            try {
              const current = todayUiTimeRef.current;
              const prev = lastSyncedUiTimeRef.current;
              const diff = current - prev;

              if (diff > 0) {
                await firestore()
                  .collection("users")
                  .doc(user.uid)
                  .update({
                    todayTotalTime: firestore.FieldValue.increment(diff),
                  });
                lastSyncedUiTimeRef.current = current;
              }
            } catch (e) {
              console.log("flush on app background error:", e);
            }

            await finishAllSessions({
              uid: user.uid,
              selectedSubject: user.selectedSubject,
              runningSubjectSince: user.runningSubjectSince,
              seatId: user.seatId,
              student_number: user.student_number,
            });

            isFlushingRef.current = false;
          }
        }

        appState.current = nextState;
      }
    );

    return () => subscription.remove();
  }, [
    seatStatus,
    user.runningSubjectSince,
    user.selectedSubject,
    user?.uid,
  ]);

  /* ------------------------------------------*/
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
