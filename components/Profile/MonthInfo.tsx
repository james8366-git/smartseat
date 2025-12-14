import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";

function MonthInfo() {
    const { user } = useUserContext();
    const today = new Date();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [showModal, setShowModal] = useState(false);

    //  월간 데이터 저장 ( { "1": 3600, "2":0, ... } )
    const [monthData, setMonthData] = useState({});  

    //  포맷 (HH:MM)
    const formatHM_KR = (sec) => {
    if (!sec || sec <= 0) return "0시간 0분";
    
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);

    return `${h}시간 ${m}분`;
    };

    /* ========================================================
        월 데이터 Firestore 불러오기
       ======================================================== */
    useEffect(() => {
        if (!user?.uid) return;
        
        const fetchMonth = async () => {
            const mm = String(month).padStart(2, "0");
            const yyyy = year;

            const first = `${yyyy}-${mm}-01`;
            const last  = `${yyyy}-${mm}-31`;

            const snap = await firestore()
              .collection("stats")
              .doc(user.uid)
              .collection("daily")
              .where(firestore.FieldPath.documentId(), ">=", first)
              .where(firestore.FieldPath.documentId(), "<=", last)
              .get();

            const temp = {};
            snap.forEach(doc => {
                const id = doc.id;
                const day = parseInt(id.split("-")[2]);
                temp[day] = doc.data()?.dailyTotalTime ?? 0;
            });

            setMonthData(temp);
        };

        fetchMonth();
    }, [user?.uid, year, month]);

    /* ========================================================
       ✔ 월 공부시간 합계
       ======================================================== */
        const calcMonthlyTotal = () => {
            const sum = Object.values(monthData).reduce((a, b) => a + b, 0);
            return formatHM_KR(sum);   // HH시간 MM분
        };


    /* ========================================================
    ✔ 한 달 전체 중 가장 긴 연속 공부일수
    ======================================================== */
    const calcMaxStreak = () => {
        const days = Object.keys(monthData)
            .map(Number)
            .sort((a, b) => a - b); // 날짜 순 정렬

        let maxStreak = 0;
        let currentStreak = 0;

        for (const d of days) {
            const sec = monthData[d] ?? 0;
            if (sec > 0) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
            } else {
            currentStreak = 0; // 끊김
            }
        }

        return `${maxStreak}일`;
    };


    /* ========================================================
       ✔ 하루 최다 공부시간
       ======================================================== */
    const calcMaxDay = () => {
        const arr = Object.values(monthData);
        if (arr.length === 0) return "00:00";

        const max = Math.max(...arr);
        return formatHM_KR(max);
    };

    /* ========================================================
       UI / Month Selector 기능
       ======================================================== */
    const handlePrevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(prev => prev - 1);
        } 
        else setMonth(prev => prev - 1);
    };

    const handleNextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(prev => prev + 1);
        } 
        else setMonth(prev => prev + 1);
    };

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const years = Array.from({ length: 10 }, (_, i) => year - 5 + i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const selectYearMonth = (year, month) => {
        setYear(year);
        setMonth(month);
        closeModal();
    };

    return (
        <View style={styles.container}>

            <View style={styles.monthBar}>
                <TouchableOpacity onPress={handlePrevMonth}>
                    <Icon name="chevron-left" size={28} color="#333" />
                </TouchableOpacity>

                <TouchableOpacity onPress={openModal}>
                    <Text style={styles.monthText}>{`${year}.${month}`}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleNextMonth}>
                    <Icon name="chevron-right" size={28} color="#333" />
                </TouchableOpacity>
            </View>

            {/*  실제 계산 결과 표시 */}
            <View style={styles.listBox}>
                <View style={styles.row}>
                    <Text style={styles.title}>월 공부 시간</Text>
                    <Text style={styles.value}>{calcMonthlyTotal()}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.title}>최대연속 공부일수</Text>
                    <Text style={styles.value}>{calcMaxStreak()}</Text>
                </View>

                <View style={styles.row}>
                    <Text style={styles.title}>하루 최다 공부시간</Text>
                    <Text style={styles.value}>{calcMaxDay()}</Text>
                </View>
            </View>

            {/* 년/월 선택 모달 */}
            <Modal visible={showModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>년 / 월 선택</Text>

                        <FlatList
                            data={years}
                            keyExtractor={(y) => y.toString()}
                            renderItem={({ item: y }) => (
                                <View style={styles.yearSection}>
                                    <Text style={styles.yearLabel}>{y}년</Text>

                                    <View style={styles.monthGrid}>
                                        {months.map((m) => (
                                            <TouchableOpacity
                                                key={`${y}-${m}`}
                                                style={[
                                                    styles.monthItem,
                                                    y === year && m === month && styles.activeMonth,
                                                ]}
                                                onPress={() => selectYearMonth(y, m)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.monthItemText,
                                                        y === year && m === month && styles.activeMonthText,
                                                    ]}
                                                >
                                                    {m}월
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}
                        />

                        <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                            <Text style={styles.closeText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

export default MonthInfo;

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "white",
    },

    monthBar: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#eaf0fb",
        paddingVertical: 8,
    },

    monthText: { 
        fontSize: 20, 
        fontWeight: "600", 
        color: "#333333", 
        marginHorizontal: 12 
    },

    listBox: { 
        width: "100%",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: "#e0e0e0",
    },

    title: { 
        fontSize: 15, 
        color: "#828282" 
    },
    value: { 
        fontSize: 15, 
        color: "#828282"
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalBox: {
        backgroundColor: "white",
        width: "85%",
        height: "70%",
        borderRadius: 12,
        padding: 16,
    },

    modalTitle: { 
        fontSize: 20, 
        fontWeight: "bold", 
        textAlign: "center", 
        marginBottom: 8 
    },

    yearSection: { 
        marginBottom: 12 
    },

    yearLabel: { 
        fontSize: 18, 
        fontWeight: "600", 
        marginBottom: 6 
    },

    monthGrid: { 
        flexDirection: "row", 
        flexWrap: "wrap", 
        justifyContent: "space-between" 
    },

    monthItem: {
        width: "22%",
        paddingVertical: 8,
        marginVertical: 4,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 6,
    },

    activeMonth: { 
        backgroundColor: "#005bac", 
        borderColor: "#005bac" 
    },

    monthItemText: { 
        fontSize: 16, 
        color: "#333333",
    },

    activeMonthText: { 
        color: "white", 
        fontWeight: "600",
    },

    closeButton: {
        backgroundColor: "#4d8ceb",
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },

    closeText: { 
        color: "white", 
        fontWeight: "600", 
        textAlign: "center", 
        fontSize: 16 
    },
});

export default MonthInfo;
