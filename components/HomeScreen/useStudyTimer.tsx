// useStudyTimer.tsx — FINAL PATCH VERSION (FULL CODE)
// ✔ 과목 삭제 시 TodayTimer 오차 증가 버그 해결
// ✔ runningSubjectSince=null 되는 순간 UI 시간을 DB 기준으로 리셋

import { useEffect, useMemo, useState, useRef } from "react";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";

export function useStudyTimer() {
  const { user } = useUserContext();

  const [seatStatus, setSeatStatus] = useState("empty");
  const [subjectTimesState, setSubjectTimesState] = useState({});

  /* --------------------------------------------------
   * 좌석 상태 실시간 구독
   * -------------------------------------------------- */
  useEffect(() => {
    if (!user?.seatId) {
      setSeatStatus("empty");
      return;
    }

    return firestore()
      .collection("seats")
      .doc(user.seatId)
      .onSnapshot((snap) => {
        const d = snap.data();
        setSeatStatus(d?.status ?? "empty");
      });
  }, [user?.seatId]);

  /* --------------------------------------------------
   * occupied → runningSubjectSince 시작
   * -------------------------------------------------- */
  useEffect(() => {
    if (!user?.uid) return;

    if (seatStatus === "occupied" && !user.runningSubjectSince) {
      firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          runningSubjectSince: firestore.Timestamp.now(),
        });
    }
  }, [seatStatus, user?.uid, user?.runningSubjectSince]);

  /* --------------------------------------------------
   * empty/object/none → runningSubjectSince 종료
   * -------------------------------------------------- */
  useEffect(() => {
    if (!user?.uid) return;

    if (seatStatus !== "occupied" && user.runningSubjectSince) {
      firestore().collection("users").doc(user.uid).update({
        runningSubjectSince: null,
      });
    }
  }, [seatStatus, user?.uid, user?.runningSubjectSince]);

  /* --------------------------------------------------
   * tick (UI diff 계산)
   * -------------------------------------------------- */
  const isActive =
    seatStatus === "occupied" && !!user?.runningSubjectSince;

  const [tick, setTick] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !intervalRef.current) {
      intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000);
    }

    if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isActive]);

  /* --------------------------------------------------
   * Firestore subject.time → 로컬 초기 반영
   * -------------------------------------------------- */
  useEffect(() => {
    if (!user?.subject) return;

    setSubjectTimesState(() => {
      const next = {};
      Object.entries(user.subject).forEach(([id, s]) => {
        next[id] = s.time ?? 0;
      });
      return next;
    });
  }, [user?.subject]);

  /* --------------------------------------------------
   * ⭐ 핵심 FIX
   * runningSubjectSince === null (즉, 삭제/반납/이탈) → UI 시간 강제 초기화
   * -------------------------------------------------- */
  useEffect(() => {
    if (!user?.runningSubjectSince) {
      if (!user?.subject) return;

      // DB 기준으로 즉시 리셋
      setSubjectTimesState(() => {
        const next = {};
        Object.entries(user.subject).forEach(([id, s]) => {
          next[id] = s.time ?? 0;
        });
        return next;
      });
    }
  }, [user?.runningSubjectSince]);  // ← 핵심

  /* --------------------------------------------------
   * Active diff 계산 → UI 시간 증가
   * -------------------------------------------------- */
  useEffect(() => {
    if (!isActive) return;

    const subjectId = user.selectedSubject;
    const since = user.runningSubjectSince;
    if (!subjectId || !since) return;

    const start = since.toDate().getTime() / 1000;
    const nowSec = Date.now() / 1000;
    const diff = Math.max(0, Math.floor(nowSec - start));

    setSubjectTimesState((prev) => {
      const base = user.subject?.[subjectId]?.time ?? 0;
      return {
        ...prev,
        [subjectId]: base + diff,
      };
    });
  }, [tick, isActive, user?.subject, user?.runningSubjectSince]);

  /* --------------------------------------------------
   * Today Total
   * -------------------------------------------------- */
  const todayUiTime = useMemo(() => {
    return Object.values(subjectTimesState).reduce((a, b) => a + b, 0);
  }, [subjectTimesState]);

  return {
    subjectTimes: subjectTimesState,
    todayUiTime,
    seatStatus,
  };
}
