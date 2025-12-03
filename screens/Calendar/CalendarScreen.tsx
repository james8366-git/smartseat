// CalendarScreen.tsx — FINAL FULL VERSION (UUID → 과목명 변환 포함)
// 주의: CSS 단 1px도 수정 없음. UI 구조 완전 동일.
// 기능만 추가됨.

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
import Icon from "react-native-vector-icons/MaterialIcons";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";

function Calendar() {
  const today = new Date();
  const { user } = useUserContext();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [monthStats, setMonthStats] = useState({});
  const [dailyDetail, setDailyDetail] = useState(null);

  // 🔥 추가된 부분
  const [subjectMap, setSubjectMap] = useState({}); // { uuid: {name, time} }

  // ============================================================
  // ✔ 유저의 과목 목록(uuid → name) 구독 — UUID → 과목명 매핑용
  // ============================================================
  useEffect(() => {
    if (!user?.uid) return;

    const unsub = firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((snap) => {
        const data = snap.data();
        if (data?.subject) {
          setSubjectMap(data.subject); // { uuid: {name, time} }
        }
      });

    return () => unsub();
  }, [user?.uid]);

  // ============================================================
  // ✔ 월간 stats.daily 불러오기
  // ============================================================
  useEffect(() => {
    if (!user?.uid) return;

    const fetchMonth = async () => {
      const mm = String(month).padStart(2, "0");
      const yyyy = year;

      const firstDate = `${yyyy}-${mm}-01`;
      const lastDate = `${yyyy}-${mm}-31`;

      const snapshot = await firestore()
        .collection("stats")
        .doc(user.uid)
        .collection("daily")
        .where(firestore.FieldPath.documentId(), ">=", firstDate)
        .where(firestore.FieldPath.documentId(), "<=", lastDate)
        .get();

      const data = {};
      snapshot.forEach((doc) => {
        const id = doc.id;
        const parts = id.split("-");
        const day = String(parseInt(parts[2]));
        const val = doc.data()?.dailyTotalTime ?? 0;
        data[day] = val;
      });

      setMonthStats(data);
    };

    fetchMonth();
  }, [user?.uid, year, month]);

  // ============================================================
  // ✔ 날짜 클릭 → 상세 데이터 불러오기
  // ============================================================
  const handlePressDate = async (day) => {
    setSelectedDate(day);
    setShowModal(true);

    const yyyy = year;
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const docId = `${yyyy}-${mm}-${dd}`;

    const snap = await firestore()
      .collection("stats")
      .doc(user.uid)
      .collection("daily")
      .doc(docId)
      .get();

    if (!snap.exists) {
      setDailyDetail({
        total: 0,
        subjects: {},
        firstStudyAt: null,
      });
      return;
    }

    const data = snap.data();

    setDailyDetail({
      total: data.dailyTotalTime ?? 0,
      subjects: data.subjects ?? {},
      firstStudyAt: data.firstStudyAt ?? null,
    });
  };

  // ============================================================
  // ✔ UUID → 과목명 변환
  // ============================================================
  const convertSubjects = (subjectsMap) => {
    if (!subjectsMap) return [];

    return Object.entries(subjectsMap).map(([uuid, sec]) => {
      const info = subjectMap[uuid];
      const name = info?.name ?? uuid; // 이름 없으면 uuid 그대로
      return { name, sec };
    });
  };

  // ============================================================
  // ✔ UI 색 결정
  // ============================================================
  const getColorByTime = (time) => {
    if (time >= 600 * 60) return "#72A6F3";
    if (time >= 420 * 60) return "#A2C6FC";
    if (time >= 240 * 60) return "#D3E3FF";
    if (time > 0) return "#EEF4FF";
    return "transparent";
  };

  // ============================================================
  // ✔ 시간 포맷
  // ============================================================
  const formatHM = (sec) => {
    if (!sec || sec <= 0) return "00:00";
    const totalMin = Math.floor(sec / 60);
    const h = String(Math.floor(totalMin / 60)).padStart(2, "0");
    const m = String(totalMin % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  // ============================================================
  // ✔ 월 평균 시간
  // ============================================================
  const calcMonthlyAverage = () => {
    const vals = Object.values(monthStats);
    if (vals.length === 0) return "00:00";

    const sum = vals.reduce((a, b) => a + b, 0);
    return formatHM(Math.floor(sum / vals.length));
  };

  // 달력 데이터 구성
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <View style={styles.container}>
      <Text style={styles.yearText}>{year}</Text>

      <View style={styles.monthBar}>
        <TouchableOpacity
          onPress={() => {
            if (month === 1) {
              setMonth(12);
              setYear((y) => y - 1);
            } else setMonth((m) => m - 1);
          }}
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
          <Text style={styles.summaryValue}>0일</Text>
        </View>
      </View>

      <View style={styles.weekRow}>
        {["SUN", "MON", "TUE", "WED", "THU", "FRRI", "SAT"].map((w, idx) => (
          <Text
            key={idx}
            style={[
              styles.weekText,
              idx === 0 && { color: "red" },
              idx === 6 && { color: "#005bac" },
            ]}
          >
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarCells.map((day, index) => {
          const time = monthStats[String(day)] ?? 0;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.dayCell, { backgroundColor: getColorByTime(time) }]}
              disabled={!day}
              onPress={() => day && handlePressDate(day)}
            >
              {day && (
                <>
                  <Text style={styles.dayText}>{day}</Text>
                  {time > 0 && (
                    <Text style={styles.timeText}>{formatHM(time)}</Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {year}년 {month}월 {selectedDate}일
            </Text>

            {dailyDetail && (
              <ScrollView style={{ width: "100%" }}>
                <Text>총 공부시간: {formatHM(dailyDetail.total)}</Text>

                <Text style={{ marginTop: 10, fontWeight: "600" }}>
                  과목별 공부시간
                </Text>

                {convertSubjects(dailyDetail.subjects).map((item) => (
                  <Text key={item.name}>
                    {item.name}: {formatHM(item.sec)}
                  </Text>
                ))}

                <Text style={{ marginTop: 10, fontWeight: "600" }}>
                  첫 공부 시작 시각
                </Text>
                {dailyDetail.firstStudyAt ? (
                  <Text>
                    {(() => {
                      const d = dailyDetail.firstStudyAt.toDate();
                      const hh = String(d.getHours()).padStart(2, "0");
                      const mm = String(d.getMinutes()).padStart(2, "0");
                      return `${hh}:${mm}`;
                    })()}
                  </Text>
                ) : (
                  <Text>-</Text>
                )}
              </ScrollView>
            )}

            <Pressable
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.closeText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ----------------------------
// ⚠️ 스타일 절대 수정 금지
// ----------------------------
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
  todayText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  summaryBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "90%",
    marginBottom: 10,
  },
  summaryItem: { alignItems: "center" },
  summaryLabel: { fontSize: 14, color: "#666", marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: "600", color: "#555" },
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
  dayText: { fontSize: 14, color: "#333" },
  timeText: { fontSize: 12, color: "#333" },
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
  closeText: { color: "white", fontWeight: "600" },
});

export default Calendar;
