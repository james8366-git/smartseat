import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";

function DailyInfo() {
    const { user } = useUserContext();

    /* ===============================
    * 날짜 상태
    * =============================== */
    const todayDate = new Date();
    const [viewDate, setViewDate] = useState(new Date());

    const getDateKey = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const todayKey = getDateKey(todayDate);
    const viewKey = getDateKey(viewDate);
    const isToday = todayKey === viewKey;
    const displayDate = viewKey.replace(/-/g, ".");

    /* ===============================
    * 🔒 Timestamp / Date 방어 변환
    * =============================== */
    const safeToDate = (ts: any): Date | null => {
        if (!ts) return null;
        if (ts instanceof Date) return ts;
        if (typeof ts.toDate === "function") return ts.toDate();
        return null;
    };

    /* ===============================
    * 목표 시간
    * =============================== */
    const [targetTime, setTargetTime] = useState("00:00");
    const [goalMinutes, setGoalMinutes] = useState(0);
    const [showTimeModal, setShowTimeModal] = useState(false);

    /* ===============================
    * 선택일 데이터
    * =============================== */
    const [todayStudyMin, setTodayStudyMin] = useState(0);
    const [startTimeText, setStartTimeText] = useState("00:00");

    /* ===============================
    * users 목표 시간 로드 (기존 유지)
    * =============================== */
    useEffect(() => {
        if (!user?.uid) return;

        const unsub = firestore()
        .collection("users")
        .doc(user.uid)
        .onSnapshot((doc) => {
            if (!doc.exists) return;

            const g = doc.data().goals || 0;
            setGoalMinutes(g);

            const h = String(Math.floor(g / 60)).padStart(2, "0");
            const m = String(g % 60).padStart(2, "0");
            setTargetTime(`${h}:${m}`);
        });

        return () => unsub();
    }, [user?.uid]);

    /* ===============================
    * 목표 시간 저장 (오늘만 가능)
    * =============================== */
    const selectTime = async (time: string) => {
        if (!isToday) return;

        setTargetTime(time);
        setShowTimeModal(false);

        const [h, m] = time.split(":").map(Number);
        const total = h * 60 + m;
        setGoalMinutes(total);

        await firestore()
        .collection("users")
        .doc(user.uid)
        .update({ goals: total });
    };

    /* ===============================
    * stats 구독 (선택한 날짜 기준)
    * =============================== */
        useEffect(() => {
        if (!user?.uid) return;

        const unsub = firestore()
            .collection("stats")
            .doc(user.uid)
            .collection("daily")
            .doc(viewKey)
            .onSnapshot((doc) => {
            if (!doc.exists) {
                setTodayStudyMin(0);
                setStartTimeText("00:00");
                return;
            }

            const data = doc.data();

            // 공부 시간
            const studySec = data.dailyTotalTime ?? 0;
            setTodayStudyMin(Math.floor(studySec / 60));

            // 공부 시작 시간
            const ts = data.firstStudyAt;
            if (!ts) {
                setStartTimeText("00:00");
                return;
            }

            const d = safeToDate(ts);
            if (!d) {
                setStartTimeText("00:00");
                return;
            }

            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            setStartTimeText(`${hh}:${mm}`);
            });

        return () => unsub();
        }, [user?.uid, viewKey]);


    /* ===============================
    * 날짜 이동
    * =============================== */
    const moveDay = (diff: number) => {
        const next = new Date(viewDate);
        next.setDate(next.getDate() + diff);

        if (getDateKey(next) > todayKey) return;
        setViewDate(next);
    };

    const progressPercent =
        goalMinutes === 0
        ? 0
        : Math.min(todayStudyMin / goalMinutes, 1) * 100;

    /* ===============================
    * UI
    * =============================== */
    return (
        <View style={styles.contentList}>
            {/* 날짜 바 */}
            <View style={styles.dateBar}>
                <TouchableOpacity onPress={() => moveDay(-1)}>
                    <Icon name="chevron-left" size={28} />
                </TouchableOpacity>

                <Text style={styles.dateText}>{displayDate}</Text>

                <TouchableOpacity disabled={isToday} onPress={() => moveDay(1)}>
                    <Icon
                        name="chevron-right"
                        size={28}
                        color={isToday ? "#ccc" : "#333"}
                    />
                </TouchableOpacity>
            </View>

            {/* 공부 시작 시간 */}
            <View style={styles.contentBox}>
                <Text style={styles.contentTitle}>공부시작시간</Text>
                <Text style={styles.contentText}>{startTimeText}</Text>
            </View>

            {/* 목표 시간 */}
            <View style={styles.contentBox}>
                <Text style={styles.contentTitle}>목표 시간</Text>
                <View style={styles.rightGroup}>
                    <Text style={styles.contentText}>{targetTime}</Text>
                    {isToday && 
                        (
                            <TouchableOpacity onPress={() => setShowTimeModal(true)}>
                                <Icon name="arrow-drop-down" size={28} color="#333" />
                            </TouchableOpacity>
                        )
                    }
            </View>
        </View>

        {/* 목표 시간 선택 모달 */}
        <Modal visible={showTimeModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>목표 시간 선택</Text>

                    <FlatList
                        data={[
                            ...Array.from({ length: 24 }).flatMap((_, h) => [
                            `${String(h).padStart(2, "0")}:00`,
                            `${String(h).padStart(2, "0")}:30`,
                            ]),
                        ]}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.timeItem}
                                onPress={() => selectTime(item)}
                            >
                                <Text style={styles.timeText}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowTimeModal(false)}
                    >
                        <Text style={styles.closeText}>닫기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>

        {/* 공부 시간 */}
        <View style={styles.contentBox}>
            <Text style={styles.contentTitle}>공부시간</Text>
            <Text style={styles.contentText}>
                {String(Math.floor(todayStudyMin / 60)).padStart(2, "0")}:
                {String(todayStudyMin % 60).padStart(2, "0")}
            </Text>
        </View>

            {/* 그래프 */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                <View style={styles.progressRemain} />
            </View>

            <View style={styles.progressLabel}>
                <Text style={styles.graphLabel}>오늘 공부시간</Text>
                <Text style={styles.graphLabel}>목표시간</Text>
            </View>
        </View>
    );
}

export default DailyInfo;

const styles = StyleSheet.create({
    contentList: { 
        flex: 1 
    },
    contentBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "white",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: "#e0e0e0",
    },
    contentTitle: { 
        fontSize: 15, 
        color: "#828282", 
        marginLeft: 24 
    },
    contentText: { 
        fontSize: 15, 
        color: "#828282", 
        marginRight: 24 
    },

    rightGroup: { 
        flexDirection: "row",
        alignItems: "center", 
        gap: 10 
    },

    progressContainer: {
        flexDirection: "row",
        width: "90%",
        alignSelf: "center",
        height: 20,
        backgroundColor: "#ccc",
        borderRadius: 6,
        marginTop: 20,
        overflow: "hidden",
    },
    progressFill: { 
        backgroundColor: "#005bac" 
    },
    progressRemain: { 
        flex: 1, 
        backgroundColor: "#ddd" 
    },

    progressLabel: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "90%",
        alignSelf: "center",
        marginTop: 8,
    },
    graphLabel: { 
        color: "#555", 
        fontSize: 14 
    },

    dateBar: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#eaf0fb",
        paddingVertical: 8,
    },
    dateText: { 
        fontSize: 20,
        fontWeight: "600", 
        color: "#333" 
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "80%",
        height: "70%",
        backgroundColor: "white",
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    timeItem: {
        paddingVertical: 10,
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    timeText: { fontSize: 18, color: "#333" },
    closeButton: {
        backgroundColor: "#005bac",
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },
    closeText: {
        color: "white",
        fontWeight: "600",
        textAlign: "center",
        fontSize: 16,
    },
});
