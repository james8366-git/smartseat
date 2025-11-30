// components/HomeScreen/useStudyTimer.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";

/**
 * subjects: users/{uid}/subject → 배열 형태
 * ➜ 각 subject는 반드시 { id, name, selected, time } 가지고 있어야 함
 *
 * 반환값:
 *  - subjectTimes[subjectId] = UI에서 표시할 time(초)
 *  - todayUiTime = 모든 과목 time 합계(초)
 *  - seatStatus = "occupied" | "idle"
 */

export function useStudyTimer(subjects) {
  const { user } = useUserContext();
  const uid = user?.uid;

  const [seatStatus, setSeatStatus] = useState<"occupied" | "idle">("idle");

  /* ------------------------------------------------------
   * 1) 좌석 상태 구독
   * ------------------------------------------------------ */
  useEffect(() => {
    if (!user?.seatId) {
      setSeatStatus("idle");
      return;
    }

    const unsub = firestore()
      .collection("seats")
      .doc(user.seatId)
      .onSnapshot((snap) => {
        const data = snap.data() as any;
        if (!data || data.status !== "occupied") {
          setSeatStatus("idle");
        } else {
          setSeatStatus("occupied");
        }
      });

    return () => unsub();
  }, [user?.seatId]);

  /* ------------------------------------------------------
   * 2) empty/none/object 상태면 runningSubjectSince 강제 종료
   * ------------------------------------------------------ */
  useEffect(() => {
    if (!uid) return;

    if (seatStatus !== "occupied" && user?.runningSubjectSince) {
      firestore().collection("users").doc(uid).update({
        runningSubjectSince: null,
      });
    }
  }, [seatStatus, uid]);

  /* ------------------------------------------------------
   * 3) 자리 앉을 때 자동 beginSubject (selectedSubject 기준)
   * ------------------------------------------------------ */
  useEffect(() => {
    if (seatStatus !== "occupied") return;

    // runningSubjectSince가 없다면, 새로 시작해야 함
    if (!user?.runningSubjectSince && user?.selectedSubject) {
      firestore().collection("users").doc(uid).update({
        runningSubjectSince: firestore.Timestamp.now(),
      });
    }
  }, [seatStatus]);

  /* ------------------------------------------------------
   * 4) tick (1초 단위로 증가)
   * ------------------------------------------------------ */
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hasRunning =
      !!user?.runningSubjectSince && !!user?.selectedSubject;

    const shouldRun = seatStatus === "occupied" && hasRunning;

    if (shouldRun && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTick((t) => t + 1);
      }, 1000);
    } else if (!shouldRun && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [seatStatus, user?.selectedSubject, user?.runningSubjectSince]);

  /* ------------------------------------------------------
   * 5) UI time 계산
   * ------------------------------------------------------ */
  const { subjectTimes, todayUiTime } = useMemo(() => {
    // 1) DB에서 온 base time(초)
    const base: Record<string, number> = {};
    subjects.forEach((s) => {
      base[s.id] = typeof s.time === "number" ? s.time : 0;
    });

    const result = { ...base };

    // 2) 현재 선택된 과목만 diff 적용
    const runningName = user?.selectedSubject;
    const runningSubject = subjects.find((s) => s.name === runningName);
    const runningId = runningSubject?.id;

    const runningSince = user?.runningSubjectSince;

    if (seatStatus === "occupied" && runningId && runningSince) {
      const nowSec = Math.floor(Date.now() / 1000);
      const startSec = Math.floor(
        runningSince.toDate().getTime() / 1000
      );
      const diff = Math.max(0, nowSec - startSec);

      result[runningId] = result[runningId] + diff;
    }

    // 3) TodayTimer = 모든 과목 time 합
    const today = Object.values(result).reduce((a, b) => a + b, 0);

    return {
      subjectTimes: result,
      todayUiTime: today,
    };
  }, [
    tick,
    subjects,
    seatStatus,
    user?.selectedSubject,
    user?.runningSubjectSince,
  ]);

  return {
    subjectTimes, // { subjectId: 초 }
    todayUiTime,  // TodayTimer는 초 단위
    seatStatus,
  };
}
