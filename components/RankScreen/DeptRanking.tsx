// screens/Rank/components/DeptRanking.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import firestore from "@react-native-firebase/firestore";

console.log("a");
console.log("a");


const formatHMS = (sec: number) => {
    if (!sec || sec < 0) sec = 0;
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
};

type RankingItem = {
    id: string;
    nickname: string;
    time: number;
    rank: number;
};

function DeptRanking() {
    const [departments, setDepartments] = useState<string[]>([]);
    const [openDept, setOpenDept] = useState<Record<string, boolean>>({});
    const [deptRankings, setDeptRankings] = useState<
        Record<string, RankingItem[]>
    >({});

    // 🔵 users 전체를 한 번만 구독하고, 학과별로 그룹핑
    useEffect(() => {
        const unsub = firestore()
        .collection("users")
        .where("isadmin", "==", false)
        .onSnapshot((snap) => {
            if (!snap || !snap.docs) return;

            // 학과별로 모으기
            const deptMap: Record<
            string,
            { id: string; nickname: string; time: number }[]
            > = {};

            snap.docs.forEach((doc) => {
            const d: any = doc.data() || {};
            const dept = (d.department || "").trim();
            if (!dept) return;

            if (!deptMap[dept]) deptMap[dept] = [];
            deptMap[dept].push({
                id: doc.id,
                nickname: (d.nickname || "").trim() || "(이름 없음)",
                time: d.todayTotalTime ?? 0,
            });
            });

            // 학과 목록 (가나다 순)
            const deptList = Object.keys(deptMap).sort((a, b) =>
            a.localeCompare(b, "ko")
            );
            setDepartments(deptList);

            // 각 학과별 랭킹 정렬 (시간 내림차순 → 닉네임 가나다)
            const rankingMap: Record<string, RankingItem[]> = {};
            deptList.forEach((dept) => {
            const list = deptMap[dept] || [];
            list.sort((a, b) => {
                if (b.time !== a.time) return b.time - a.time;
                return a.nickname.localeCompare(b.nickname, "ko");
            });
            rankingMap[dept] = list.map((x, i) => ({
                ...x,
                rank: i + 1,
            }));
            });

            setDeptRankings(rankingMap);
        });

        return () => unsub();
    }, []);

    // 🔵 학과 펼치기/접기 – Firestore 안 건드리고 local state만 변경
    const toggleDept = (dept: string) => {
        setOpenDept((prev) => ({
        ...prev,
        [dept]: !prev[dept],
        }));
    };

    return (
        <ScrollView style={{ flex: 1 }}>
        {departments.map((dept) => (
            <View key={dept}>
            <TouchableOpacity onPress={() => toggleDept(dept)} style={styles.header}>
                <View style={styles.headerRow}>
                    <Text style={styles.arrow}>{openDept[dept] ? "▲" : "▼"}</Text>
                    <Text style={styles.deptName}>{dept}</Text>
                </View>
            </TouchableOpacity>

            {openDept[dept] && (
                <View style={{ backgroundColor: "#fff" }}>
                {(deptRankings[dept] || []).map((item, index) => {
                    const medal =
                    index === 0
                        ? "#FFD700"
                        : index === 1
                        ? "#C0C0C0"
                        : index === 2
                        ? "#CD7F32"
                        : null;

                    return (
                    <View key={item.id} style={styles.row}>
                        <View style={styles.left}>
                            <View
                                style={[
                                styles.circle,
                                { backgroundColor: medal || "#FFF" },
                                ]}
                            />
                            <Text style={styles.name}>{item.nickname}</Text>
                        </View>
                        <Text style={styles.time}>{formatHMS(item.time)}</Text>
                    </View>
                    );
                })}
                </View>
            )}
            </View>
        ))}
        </ScrollView>
    );
}

export default React.memo(DeptRanking);

const styles = StyleSheet.create({
  header: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrow: {
    color: "#000",
    marginRight: 8,
    fontSize: 18,
  },
  deptName: { fontSize: 18, color: "#777" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  left: { flexDirection: "row", alignItems: "center" },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  name: { fontSize: 16, color: "#333" },
  time: { fontSize: 15, color: "#555" },
});
