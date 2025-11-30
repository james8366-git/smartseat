// screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import TodayTimer from "../components/HomeScreen/TodayTimer";
import StudyList from "../components/HomeScreen/StudyList";
import ReturnSeat from "../components/HomeScreen/ReturnSeat";

import { useUserContext } from "../contexts/UserContext";
import firestore from "@react-native-firebase/firestore";

import { getSubjects } from "../lib/users";
import { useStudyTimer } from "../components/HomeScreen/useStudyTimer";

export default function HomeScreen() {
  const { user, setUser } = useUserContext();

  const [subjects, setSubjects] = useState([]);
  const [seatData, setSeatData] = useState(null);

  /* -----------------------------------------------------
   * diff 기반 UI 타이머
   * ----------------------------------------------------- */
  const { todayUiTime, subjectTimes, seatStatus } = useStudyTimer(subjects);

  /* -----------------------------------------------------
   * user 구독
   * ----------------------------------------------------- */
  useEffect(() => {
    if (!user?.uid) return;

    const unsub = firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot(async (doc) => {
        if (!doc.exists) return;

        const data = doc.data();
        const { subject, ...rest } = data;

        // user 정보 갱신 (subject는 따로 관리)
        setUser((prev) => ({ ...prev, ...rest }));

        // subjects 최신화
        const list = await getSubjects(user.uid);
        setSubjects(list);
      });

    return () => unsub();
  }, [user?.uid]);

  /* -----------------------------------------------------
   * 좌석 라벨 구독
   * ----------------------------------------------------- */
  useEffect(() => {
    if (!user?.seatId) {
      setSeatData(null);
      return;
    }

    const unsub = firestore()
      .collection("seats")
      .doc(user.seatId)
      .onSnapshot((snap) => {
        if (snap.exists) setSeatData(snap.data());
        else setSeatData(null);
      });

    return () => unsub();
  }, [user?.seatId]);

  return (
    <View style={styles.container}>
      <TodayTimer uiTime={todayUiTime} />

      <ReturnSeat
        user={user}
        subjects={subjects}
        subjectTimes={subjectTimes}
        seatStatus={seatStatus}
        seatData={seatData}
        setSubjects={setSubjects}
      />

      <StudyList
        user={user}
        subjects={subjects}
        setSubjects={setSubjects}
        subjectTimes={subjectTimes}
        seatStatus={seatStatus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
