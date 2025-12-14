// CalendarScreen.tsx — 안정화 완전체 (CSS 수정 없음)

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialIcons";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";

function Calendar() {
    const today = new Date();
    const { user } = useUserContext();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);

    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);

    const [monthStats, setMonthStats] = useState<Record<string, number>>({});
    const [dailyDetail, setDailyDetail] = useState<any>(null);

    const [goalAchievedDays, setGoalAchievedDays] = useState(0);
    const [subjectMap, setSubjectMap] = useState<Record<string, any>>({});

    const [dailyUnsub, setDailyUnsub] = useState<null | (() => void)>(null);

    const safeDaily = (data: any) => ({
        dailyTotalTime: data?.dailyTotalTime ?? 0,
        subjects: data?.subjects ?? {},
        firstStudyAt: data?.firstStudyAt ?? null,
        goalMinutes: data?.goalMinutes ?? 0,
        isGoalAchieved: data?.isGoalAchieved ?? false,
    });

    /* ---------------- 오늘 값 실시간 ---------------- */
    useEffect(() => {
        if (!user?.uid) return;

        const unsub = firestore()
        .collection("users")
        .doc(user.uid)
        .onSnapshot((snap) => {
            if (!snap.exists) return;
            const data = snap.data();

            const now = new Date();
            if (
                year !== now.getFullYear() ||
                month !== now.getMonth() + 1
            )
            return;

            const dd = String(today.getDate());

            setMonthStats((prev) => ({
                ...prev,
                [dd]: data.todayTotalTime ?? 0,
            }));
        });

        return () => unsub();
    }, [user?.uid, year, month]);

    /* ---------------- 과목 map ---------------- */
    useEffect(() => {
        if (!user?.uid) return;

        const unsub = firestore()
        .collection("users")
        .doc(user.uid)
        .onSnapshot((snap) => {
            const data = snap.data();
            if (data?.subject) setSubjectMap(data.subject);
        });

        return () => unsub();
    }, [user?.uid]);

    /* ---------------- 월 단위 실시간 ---------------- */
    useEffect(() => {
        if (!user?.uid) return;

        const mm = String(month).padStart(2, "0");
        const yyyy = year;

        const firstDate = `${yyyy}-${mm}-01`;
        const lastDate = `${yyyy}-${mm}-31`;

        const unsub = firestore()
            .collection("stats")
            .doc(user.uid)
            .collection("daily")
            .where(firestore.FieldPath.documentId(), ">=", firstDate)
            .where(firestore.FieldPath.documentId(), "<=", lastDate)
            .onSnapshot((snap) => {
                const data: Record<string, number> = {};
                let achieved = 0;

                snap.forEach((doc) => {
                const parts = doc.id.split("-");
                const day = String(parseInt(parts[2], 10));
                const daily = doc.data();

                data[day] = daily.dailyTotalTime ?? 0;
                if (daily?.isGoalAchieved === true) achieved += 1;
            });

            setMonthStats(data);
            setGoalAchievedDays(achieved);
        });

        return () => unsub();
    }, [user?.uid, year, month]);

    /* ---------------- 날짜 클릭 ---------------- */
    const handlePressDate = (day: number) => {
        setSelectedDate(day);
        setShowModal(true);

        const yyyy = year;
        const mm = String(month).padStart(2, "0");
        const dd = String(day).padStart(2, "0");

        if (dailyUnsub) {
        dailyUnsub();
        setDailyUnsub(null);
        }

        const unsub = firestore()
            .collection("stats")
            .doc(user.uid)
            .collection("daily")
            .doc(`${yyyy}-${mm}-${dd}`)
            .onSnapshot((snap) => {
                setDailyDetail(
                safeDaily(snap.exists ? snap.data() : null)
            );
        });

        setDailyUnsub(() => unsub);
    };

    const convertSubjects = (map: any) => {
        if (!map || !subjectMap) return [];
        return Object.entries(map)
            .filter(([uuid]) => !!subjectMap[uuid])
            .map(([uuid, sec]: any) => ({
                name: subjectMap[uuid].name,
            sec,
        }));
    };

    const getColorByTime = (time: number) => {
        if (time >= 600 * 60) return "#72A6F3";
        if (time >= 420 * 60) return "#A2C6FC";
        if (time >= 240 * 60) return "#D3E3FF";
        if (time > 0) return "#EEF4FF";
        return "transparent";
    };

    const formatHM = (sec: number) => {
        if (!sec || sec <= 0) return "00:00";
        const m = Math.floor(sec / 60);
        return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(
        m % 60
        ).padStart(2, "0")}`;
    };

    const formatHMS = (sec: number) => {
        if (!sec || sec <= 0) return "00:00:00";
        return `${String(Math.floor(sec / 3600)).padStart(2, "0")}:${String(
        Math.floor((sec % 3600) / 60)
        ).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
    };

    const calcMonthlyAverage = () => {
        const values = Object.values(monthStats).filter((sec) => sec > 0);
        if (values.length === 0) return "00:00";
        const sum = values.reduce((a, b) => a + b, 0);
        return formatHM(Math.floor(sum / values.length));
    };

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={{ width: "100%", alignItems: "center" }}>
                <View style={styles.container}>
                    <Text style={styles.yearText}>{year}</Text>

                    <View style={styles.monthBar}>
                    <TouchableOpacity
                        onPress={() => {
                            if (month === 1) {
                                setMonth(12);
                                setYear((y) => y - 1);
                            } else setMonth((m) => m - 1);
                            }
                        }
                    >
                        <Icon name="chevron-left" size={28} color="#333" />
                    </TouchableOpacity>

                    <Text style={styles.monthText}>{month}월</Text>

                    <TouchableOpacity
                        onPress={() => {
                        if (month === 12) {
                            setMonth(1);
                            setYear((y) => y + 1);
                        } else setMonth((m) => m + 1);
                        }}
                    >
                        <Icon name="chevron-right" size={28} color="#333" />
                    </TouchableOpacity>
                    </View>

                    <View style={styles.summaryBox}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>하루 평균 공부 시간</Text>
                            <Text style={styles.summaryValue}>{calcMonthlyAverage()}</Text>
                        </View>

                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>목표 달성 일수</Text>
                            <Text style={styles.summaryValue}>{goalAchievedDays}일</Text>
                        </View>
                    </View>

                    <View style={styles.weekRow}>
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                        (w, i) => (
                        <Text
                            key={i}
                            style={[
                            styles.weekText,
                            i === 0 && { color: "red" },
                            i === 6 && { color: "#005bac" },
                            ]}
                        >
                            {w}
                        </Text>
                        )
                    )}
                    </View>

                    <View style={styles.calendarGrid}>
                    {cells.map((day, idx) => {
                        const time = monthStats[String(day)] ?? 0;

                        const isToday =
                        day &&
                        year === today.getFullYear() &&
                        month === today.getMonth() + 1 &&
                        day === today.getDate();

                        return (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                styles.dayCell,
                                { backgroundColor: getColorByTime(time) },
                                isToday && {
                                    borderWidth: 2,
                                    borderColor: "#333",
                                },
                                ]}
                                disabled={!day}
                                onPress={() => day && handlePressDate(day)}
                            >
                                {day && (
                                <>
                                    <Text style={styles.dayText}>{day}</Text>
                                    {time > 0 && (
                                            <Text style={styles.timeText}>
                                                {formatHM(time)}
                                            </Text>
                                        )
                                    }
                                </>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                    </View>
                </View>
            </View>
        </ScrollView>

        {showModal && (
            <Modal visible transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>
                        {year}년 {month}월 {selectedDate}일
                    </Text>

                    {dailyDetail && (
                        <ScrollView style={{ width: "100%" }}>
                        <Text>
                            총 공부시간: {formatHMS(dailyDetail.dailyTotalTime)}
                        </Text>

                        <Text style={{ marginTop: 10, fontWeight: "600" }}>
                            과목별 공부시간
                        </Text>

                        {convertSubjects(dailyDetail.subjects).map((item) => (
                            <Text key={item.name}>
                                {item.name}: {formatHMS(item.sec)}
                            </Text>
                        ))}

                        <Text style={{ marginTop: 10, fontWeight: "600" }}>
                            첫 공부 시각
                        </Text>
                        {dailyDetail.firstStudyAt ? (
                            <Text>
                            {(() => {
                                const d = dailyDetail.firstStudyAt.toDate();
                                return `${String(d.getHours()).padStart(
                                2,
                                "0"
                                )}:${String(d.getMinutes()).padStart(2, "0")}`;
                            })()}
                            </Text>
                        ) : (
                            <Text>없음</Text>
                        )}

                        <Text style={{ marginTop: 10, fontWeight: "600" }}>
                            일일 목표
                        </Text>

                        {dailyDetail.goalMinutes ? (
                            <>
                            <Text>
                                목표 시간:{" "}
                                {Math.floor(dailyDetail.goalMinutes / 60)}시간{" "}
                                {dailyDetail.goalMinutes % 60}분
                            </Text>
                            <Text>
                                달성 여부:{" "}
                                {dailyDetail.isGoalAchieved ? "✅ 달성" : "❌ 미달성"}
                            </Text>
                            </>
                        ) : (
                            <Text>목표 시간: 설정 안됨</Text>
                        )}
                        </ScrollView>
                    )}

                    <Pressable
                        style={styles.closeButton}
                        onPress={() => {
                        if (dailyUnsub) {
                            dailyUnsub();
                            setDailyUnsub(null);
                        }
                        setShowModal(false);
                        }}
                    >
                        <Text style={styles.closeText}>닫기</Text>
                    </Pressable>
                    </View>
                </View>
            </Modal>
        )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
    },
    yearText: {
        fontSize: 28,
        fontWeight: "600",
        color: "#555",
        marginTop: 20,
    },
    monthBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 10,
    },
    monthText: {
        fontSize: 40,
        fontWeight: "600",
        marginHorizontal: 20,
        color: "#444",
    },
    summaryBox: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignSelf: "center",
        width: "100%",
        marginBottom: 10,
    },
    summaryItem: { 
        flex: 1, 
        alignItems: "center" 
    },
    summaryLabel: { 
        fontSize: 14, 
        color: "#666", 
        marginBottom: 4 
    },
    summaryValue: { 
        fontSize: 16, 
        fontWeight: "600", 
        color: "#555" 
    },
    weekRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        paddingVertical: 6,
    },
    weekText: {
        fontSize: 14,
        color: "#555",
        width: "14.28%",
        textAlign: "center",
    },
    calendarGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        width: "100%",
        paddingHorizontal: 4,
    },
    dayCell: {
        width: "14.28%",
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 0.5,
        borderColor: "#eee",
    },
    dayText: { 
        fontSize: 14, 
        color: "#333" 
    },
    timeText: { 
        fontSize: 12, 
        color: "#333" 
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalBox: {
        width: "70%",
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 10,
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: "#005bac",
        borderRadius: 8,
    },
    closeText: { 
        color: "white", 
        fontWeight: "600" 
    },
});

export default Calendar;
