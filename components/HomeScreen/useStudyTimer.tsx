import { useEffect, useMemo, useState } from "react";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";

export function useStudyTimer() {
  const { user } = useUserContext();

  const [seatStatus, setSeatStatus] =
    useState<"empty" | "occupied" | "none" | "object">("empty");

  /** DB 확정값 */
  const [dbSubjectTimes, setDbSubjectTimes] =
    useState<Record<string, number>>({});

  /** UI 표시값 */
  const [displaySubjectTimes, setDisplaySubjectTimes] =
    useState<Record<string, number>>({});

  const [lastFlushedAt, setLastFlushedAt] =
    useState<FirebaseFirestoreTypes.Timestamp | null>(null);

  /* --------------------------------------------------
   * seats 구독 (상태 + lastFlushedAt)
   * -------------------------------------------------- */
  useEffect(() => {
    if (!user?.seatId) {
      setSeatStatus("empty");
      setLastFlushedAt(null);
      return;
    }

    return firestore()
      .collection("seats")
      .doc(user.seatId)
      .onSnapshot((snap) => {
        if (!snap.exists) {
          setSeatStatus("empty");
          setLastFlushedAt(null);
          return;
        }

        const d = snap.data();
        setSeatStatus(d?.status ?? "empty");
        setLastFlushedAt(d?.lastFlushedAt ?? null);
      });
  }, [user?.seatId]);

  /* --------------------------------------------------
   * users.subject (DB 기준값 반영)
   * -------------------------------------------------- */
  useEffect(() => {
    if (!user?.subject) return;

    const next: Record<string, number> = {};
    Object.entries(user.subject).forEach(([id, s]: any) => {
      next[id] = s.time ?? 0;
    });

    setDbSubjectTimes(next);

    // 기본적으로 UI는 DB 값 그대로
    setDisplaySubjectTimes(next);
  }, [user?.subject]);

  /* --------------------------------------------------
   * occupied 상태에서만 UI 보간 (DB + diff)
   * -------------------------------------------------- */
  useEffect(() => {
    if (
      seatStatus !== "occupied" ||
      !lastFlushedAt ||
      !user?.selectedSubject
    )
      return;

    const id = setInterval(() => {
      const diff = Math.floor(
        (Date.now() - lastFlushedAt.toDate().getTime()) / 1000
      );

      if (diff <= 0) return;

      setDisplaySubjectTimes((prev) => ({
        ...prev,
        [user.selectedSubject]:
          (dbSubjectTimes[user.selectedSubject] ?? 0) + diff,
      }));
    }, 1000);

    return () => clearInterval(id);
  }, [
    seatStatus,
    lastFlushedAt,
    user?.selectedSubject,
    dbSubjectTimes,
  ]);

  /* --------------------------------------------------
   * Today Total (UI 기준)
   * -------------------------------------------------- */
  const todayUiTime = useMemo(() => {
    return Object.values(displaySubjectTimes).reduce(
      (a, b) => a + b,
      0
    );
  }, [displaySubjectTimes]);

  return {
    seatStatus,

    /** UI용 */
    subjectTimes: displaySubjectTimes,
    todayUiTime,

    /** DB 확정값 */
    dbSubjectTimes,
  };
}
