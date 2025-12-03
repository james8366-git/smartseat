// components/RankScreen/TotalRanking.tsx
import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";

function TotalRanking() {
  const { user } = useUserContext();
  const [totalRanking, setTotalRanking] = React.useState([]);
  const [myRank, setMyRank] = React.useState("-");

  const formatHMS = (sec) => {
    if (!sec || sec < 0) sec = 0;
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  React.useEffect(() => {
    if (!user?.uid) return;

    const q = firestore()
      .collection("users")
      .orderBy("todayTotalTime", "desc");

    const unsub = q.onSnapshot((snapshot) => {
      if (!snapshot || !snapshot.docs) return;

      let list = snapshot.docs.map((doc) => {
        const d = doc.data() || {};
        return {
          id: doc.id,
          nickname: d.nickname?.trim() || "(이름 없음)",
          time: d.todayTotalTime ?? 0,
          isadmin: d.isadmin ?? false,
        };
      });

      list = list.filter((x) => !x.isadmin);

      list.sort((a, b) => {
        if (b.time !== a.time) return b.time - a.time;
        return a.nickname.localeCompare(b.nickname, "ko");
      });

      list = list.map((x, i) => ({ ...x, rank: i + 1 }));

      setTotalRanking(list.slice(0, 10));

      const mine = list.find((x) => x.id === user.uid);
      setMyRank(mine ? mine.rank : "-");
    });

    return () => unsub();
  }, [user?.uid]);

  const renderRow = ({ item, index }) => {
    const medal =
      index === 0
        ? "#FFD700"
        : index === 1
        ? "#C0C0C0"
        : index === 2
        ? "#CD7F32"
        : null;

    return (
      <View style={styles.row}>
        <View style={styles.left}>
          <View
            style={[
              styles.circle,
              { backgroundColor: medal || "#FFF", borderColor: "#ddd" },
            ]}
          />
          <Text style={styles.name}>{item.nickname}</Text>
        </View>
        <Text style={styles.time}>{formatHMS(item.time)}</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.myRankBox}>
        <Text style={styles.myRankLabel}>내 등수</Text>
        <Text style={styles.myRankValue}>{myRank}</Text>
      </View>

      <FlatList
        data={totalRanking}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
      />
    </View>
  );
}

export default React.memo(TotalRanking);

const styles = StyleSheet.create({
  myRankBox: {
    backgroundColor: "#D3E3FF",
    alignItems: "center",
    paddingVertical: 40,
  },
  myRankLabel: { fontSize: 18, color: "#555" },
  myRankValue: { fontSize: 64, fontWeight: "bold", color: "#666" },

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
  },

  name: { fontSize: 16, color: "#333" },
  time: { fontSize: 15, color: "#555" },
});
