// components/HomeScreen/useStudyTimer.tsx
// FINAL-STABLE: Flicker ZERO, Rollback ZERO, DB-lag immune.

import { useEffect, useMemo, useRef, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";

export function useStudyTimer() {
  const { user } = useUserContext();

  /* --------------------------------------------------
   * 0) Persistent subjectTimes state (rollback 방지 핵심)
   * -------------------------------------------------- */
  const [subjectTimesState, setSubjectTimesState] = useState({}); // {id: seconds}

  /* --------------------------------------------------
   * 1) 좌석 상태 구독
   * -------------------------------------------------- */
  const [seatStatus, setSeatStatus] = useState("empty");

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
        setSeatStatus(d?.status === "occupied" ? "occupied" : "empty");
      });
  }, [user?.seatId]);

  /* --------------------------------------------------
   * 2) Auto start when occupied
   * -------------------------------------------------- */
  useEffect(() => {
    if (!user?.uid) return;

    if (seatStatus === "occupied" &&
        user.selectedSubject &&
        !user.runningSubjectSince) {
      firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          runningSubjectSince: firestore.Timestamp.now(),
        });
    }
  }, [seatStatus, user?.selectedSubject]);

  /* --------------------------------------------------
   * 3) Auto stop when empty
   * -------------------------------------------------- */
  useEffect(() => {
    if (!user?.uid) return;

    if (seatStatus === "empty" && user.runningSubjectSince) {
      firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          runningSubjectSince: null,
        });
    }
  }, [seatStatus]);

  /* --------------------------------------------------
   * 4) tick (active일 때만 증가)
   * -------------------------------------------------- */
  const isActive =
    seatStatus === "occupied" &&
    user?.selectedSubject &&
    user?.runningSubjectSince;

  const [tick, setTick] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTick((t) => t + 1);
      }, 1000);
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
   * 5) DB 값 반영 + rollback 방지: subjectTimesState 업데이트
   * -------------------------------------------------- */
  useEffect(() => {
    if (!user?.subject) return;

    setSubjectTimesState((prev) => {
      const next = { ...prev };

      Object.entries(user.subject).forEach(([id, s]) => {
        const dbTime = s.time ?? 0;
        next[id] = Math.max(prev[id] ?? 0, dbTime);
      });

      return next;
    });
  }, [user?.subject]);

  /* --------------------------------------------------
   * 6) Active 모드 diff 계산 후 subjectTimesState 반영
   * -------------------------------------------------- */
  useEffect(() => {
    if (!isActive) return;

    const running = user.selectedSubject!;
    const since = user.runningSubjectSince!;
    const startSec = since.toDate().getTime() / 1000;
    const nowSec = Date.now() / 1000;
    const diff = Math.max(0, Math.floor(nowSec - startSec));

    setSubjectTimesState((prev) => {
      const next = { ...prev };
      const base = user.subject?.[running]?.time ?? 0;
      next[running] = Math.max(prev[running] ?? 0, base + diff);
      return next;
    });
  }, [tick, isActive, user?.subject, user?.runningSubjectSince]);

  /* --------------------------------------------------
   * 7) Today total
   * -------------------------------------------------- */
  const todayUiTime = useMemo(() => {
    return Object.values(subjectTimesState).reduce((a, b) => a + b, 0);
  }, [subjectTimesState]);

  /* --------------------------------------------------
   * 8) Return
   * -------------------------------------------------- */
  return {
    subjectTimes: subjectTimesState, // rollback 불가능한 확정값
    todayUiTime,
    seatStatus,
  };
}
