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

  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [monthStats, setMonthStats] = useState({});
  const [dailyDetail, setDailyDetail] = useState(null);

  const [goalAchievedDays, setGoalAchievedDays] = useState(0);

  const [subjectMap, setSubjectMap] = useState({});

  const safeDaily = (data) => ({
    dailyTotalTime: data?.dailyTotalTime ?? 0,
    subjects: data?.subjects ?? {},
    firstStudyAt: data?.firstStudyAt ?? null,
  });

  // 오늘 값 실시간 반영
  useEffect(() => {
    if (!user?.uid) return;

    const unsub = firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((snap) => {
        if (!snap.exists) return;
        const data = snap.data();

      const now = new Date();
      const nowYear = now.getFullYear();
      const nowMonth = now.getMonth() + 1;

      // ⭐ 보고 있는 달이 '이번 달'일 때만 반영
      if (year !== nowYear || month !== nowMonth) return;
        const dd = String(today.getDate());
        setMonthStats((prev) => ({
          ...prev,
          [dd]: data.todayTotalTime ?? 0,
        }));
      });

    return () => unsub();
  }, [user?.uid]);

  // 과목 uuid → name map
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

  useEffect(() => {
    if (!user?.uid) return;

    const fetchMonth = async () => {
      const mm = String(month).padStart(2, "0");
      const yyyy = year;

      const firstDate = `${yyyy}-${mm}-01`;
      const lastDate = `${yyyy}-${mm}-31`;

      const snap = await firestore()
        .collection("stats")
        .doc(user.uid)
        .collection("daily")
        .where(firestore.FieldPath.documentId(), ">=", firstDate)
        .where(firestore.FieldPath.documentId(), "<=", lastDate)
        .get();

      const data: any = {};
      let achievedCount = 0;   // ⭐ 추가
      snap.forEach((doc) => {
        const parts = doc.id.split("-");
        const day = String(parseInt(parts[2]));

        const daily = doc.data();
        data[day] = daily.dailyTotalTime ?? 0;

        // ⭐ goalNotified 카운트 (없으면 false 취급)
      if (daily?.goalNotified === true) {
        achievedCount += 1;
      }
      });

      setMonthStats(data);
      setGoalAchievedDays(achievedCount);   // ⭐ 추가
    };

    fetchMonth();
  }, [user?.uid, year, month]);

  const handlePressDate = async (day) => {
    setSelectedDate(day);
    setShowModal(true);

    const yyyy = year;
    const mm = String(month).padStart(2, "0");
    const dd = String(day).padStart(2, "0");

    const doc = await firestore()
      .collection("stats")
      .doc(user.uid)
      .collection("daily")
      .doc(`${yyyy}-${mm}-${dd}`)
      .get();

    setDailyDetail(safeDaily(doc.exists ? doc.data() : null));
  };

    const convertSubjects = (map) => {
    if (!map || !subjectMap) return [];

    return Object.entries(map)
        .filter(([uuid]) => !!subjectMap[uuid]) // ⭐ 존재하는 과목만
        .map(([uuid, sec]) => ({
        name: subjectMap[uuid].name,
        sec,
        }));
    };

  const getColorByTime = (time) => {
    if (time >= 600 * 60) return "#72A6F3";
    if (time >= 420 * 60) return "#A2C6FC";
    if (time >= 240 * 60) return "#D3E3FF";
    if (time > 0) return "#EEF4FF";
    return "transparent";
  };

  const formatHM = (sec) => {
    if (!sec || sec <= 0) return "00:00";
    const m = Math.floor(sec / 60);
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const formatHMS = (sec) => {
    if (!sec || sec <= 0) return "00:00:00";
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

    const calcMonthlyAverage = () => {
    const values = Object.values(monthStats)
        .filter((sec) => sec > 0); // 0보다 큰 day만 채택

    if (values.length === 0) return "00:00";

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = Math.floor(sum / values.length);

    return formatHM(avg);
    };


  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* wrapper로 alignItems 무효화 */}
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

                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.dayCell,
                      { backgroundColor: getColorByTime(time) },
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
                        )}
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
                  <Text>총 공부시간: {formatHMS(dailyDetail.dailyTotalTime)}</Text>

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
                        const hh = String(d.getHours()).padStart(2, "0");
                        const mm = String(d.getMinutes()).padStart(2, "0");
                        return `${hh}:${mm}`;
                      })()}
                    </Text>
                  ) : (
                    <Text>없음</Text>
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
    alignSelf: 'center',
    width: "100%",
    marginBottom: 10,
  },
  summaryItem: { flex: 1, alignItems: "center" },
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
