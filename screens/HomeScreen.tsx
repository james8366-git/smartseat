// HomeScreen.tsx — FINAL (single diff source)

import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import firestore from "@react-native-firebase/firestore";

import TodayTimer from "../components/HomeScreen/TodayTimer";
import StudyList from "../components/HomeScreen/StudyList";
import ReturnSeat from "../components/HomeScreen/ReturnSeat";

import { useUserContext } from "../contexts/UserContext";
import { useStudyTimer } from "../components/HomeScreen/useStudyTimer";
import { flushSubject, updateTodayTotalTime } from "../lib/timer";

export default function HomeScreen() {
    const { user, setUser } = useUserContext();
    const { todayUiTime, subjectTimes, seatStatus } = useStudyTimer();

    const [seatData, setSeatData] = useState<any>(null);

    const flushLock = useRef(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    /* ----------------------------------------------------
    * users 구독
    * ---------------------------------------------------- */
    useEffect(() => {
        if (!user?.uid) return;

        return firestore()
        .collection("users")
        .doc(user.uid)
        .onSnapshot((snap) => {
            if (snap.exists) {
            setUser((prev) => ({ ...prev, ...snap.data() }));
            }
        });
    }, [user?.uid]);

    /* ----------------------------------------------------
    * seats 구독 (occupied → empty flush)
    * ---------------------------------------------------- */
    useEffect(() => {
        if (!user?.seatId) return;

        const seatRef = firestore().collection("seats").doc(user.seatId);
        let prevStatus: string = "empty";

        return seatRef.onSnapshot(async (snap) => {
        if (!snap.exists) return;

        const seat = snap.data();
        setSeatData(seat);

        const isLeaving =
            prevStatus === "occupied" && seat.status !== "occupied";

        if (isLeaving && seat.lastFlushedAt && !flushLock.current) {
            flushLock.current = true;

            const prev = seat.lastFlushedAt;

            const result = await flushSubject({
                uid: user.uid,
                subjectId: user.selectedSubject,
                lastFlushedAt: prev,
            });

            if (result) {
            await updateTodayTotalTime(user.uid, result.diff);
            }

            await seatRef.update({
                occupiedAt: null,
                lastFlushedAt: null,
                lastSeated: firestore.Timestamp.now(),
            });

            flushLock.current = false;
        }

        prevStatus = seat.status;
        });
    }, [user?.seatId, user?.selectedSubject]);

    /* ----------------------------------------------------
    * occupied 진입 & 앱 재실행 시 lastFlushedAt 복구
    * ---------------------------------------------------- */
    useEffect(() => {
        if (seatStatus !== "occupied" || !user?.seatId) return;

        const seatRef = firestore().collection("seats").doc(user.seatId);

        seatRef.get().then((snap) => {
        const seat = snap.data();
        if (!seat) return;

        const last = seat.lastFlushedAt;
        const now = firestore.Timestamp.now();

        // lastFlushedAt 없거나, 너무 오래되었을 때만 세팅
        if (
            !last ||
            now.toDate().getTime() - last.toDate().getTime() > 15_000
        ) {
            seatRef.update({
            lastFlushedAt: now,
            });
        }
        });
    }, [seatStatus, user?.seatId]);

    /* ----------------------------------------------------
    * 10초 주기 flush
    * ---------------------------------------------------- */
    useEffect(() => {
        if (!user?.uid) return;
        if (seatStatus !== "occupied") return;
        if (intervalRef.current) return;

        intervalRef.current = setInterval(async () => {
        if (flushLock.current) return;

        const seatRef = firestore()
            .collection("seats")
            .doc(user.seatId);

        const snap = await seatRef.get();
        const seat = snap.data();
        if (!seat?.lastFlushedAt) return;

        flushLock.current = true;

        const prev = seat.lastFlushedAt;

        const result = await flushSubject({
            uid: user.uid,
            subjectId: user.selectedSubject,
            lastFlushedAt: prev,
        });

        if (result) {
            await updateTodayTotalTime(user.uid, result.diff);

            await seatRef.update({
            lastFlushedAt: result.newTs,
            });
        }

        flushLock.current = false;
        }, 10000);

        return () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        };
    }, [seatStatus, user?.selectedSubject, user?.uid]);

    /* ----------------------------------------------------
    * UI
    * ---------------------------------------------------- */
    const statusMap: Record<string, string> = {
        none: "미예약",
        empty: "미착석",
        occupied: "공부중!",
        object: "물건!",
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.statusBar}>
                <Text style={styles.statusText}>{statusMap[seatStatus]}</Text>
            </View>

            <TodayTimer uiTime={todayUiTime} />
            <ReturnSeat user={user} seatData={seatData} />
            <StudyList subjectTimes={subjectTimes} seatStatus={seatStatus} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#fff" 
    },
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
