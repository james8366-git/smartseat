import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";

function TodayTimer() {
  const { user } = useUserContext();
  const [display, setDisplay] = useState("00:00");

  const seatUnsubRef = useRef(null);
  const userUnsubRef = useRef(null);
  const intervalRef = useRef(null);

  const format = (min) => {
    const h = String(Math.floor(min / 60)).padStart(2, "0");
    const m = String(min % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  const stopInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    if (!user?.uid) return;

    // 🔵 user의 TotalStudyTime 실시간 구독
    const userRef = firestore().collection("users").doc(user.uid);
    userUnsubRef.current = userRef.onSnapshot((snap) => {
      if (!snap.exists) return;

      const total = snap.data().TotalStudyTime ?? 0;

      // 좌석에 않앉아있으면 그냥 TotalStudyTime만 표시
      if (!user?.seatId) {
        stopInterval();
        setDisplay(format(total));
      }
    });

    return () => {
      if (userUnsubRef.current) userUnsubRef.current();
    };
  }, [user]);

  useEffect(() => {
    if (!user?.seatId) {
      stopInterval();
      return;
    }

    const seatRef = firestore().collection("seats").doc(user.seatId);

    seatUnsubRef.current = seatRef.onSnapshot(async (snap) => {
      const seat = snap.data();
      if (!seat) return;

      // 최신 user.TotalStudyTime 가져오기
      const userSnap = await firestore()
        .collection("users")
        .doc(user.uid)
        .get();
      const base = userSnap.data().TotalStudyTime ?? 0;

      if (seat.status === "occupied" && seat.occupiedAt) {
        stopInterval();

        intervalRef.current = setInterval(() => {
          const diffMin = Math.floor(
            (Date.now() - seat.occupiedAt.toMillis()) / 1000 / 60
          );

          // 🔥 오직 화면에서만 더해서 표시 (DB에는 쓰지 않음)
          setDisplay(format(base + diffMin));
        }, 1000);
      } else {
        stopInterval();
        setDisplay(format(base));
      }
    });

    return () => {
      if (seatUnsubRef.current) seatUnsubRef.current();
      stopInterval();
    };
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.text}>{display}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E6F0FF",
    height: "60%",
  },
  circle: {
    width: 275,
    height: 275,
    borderRadius: 200,
    borderWidth: 10,
    borderColor: "#5A8DEE",
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 60,
    color: "#828282",
    fontWeight: "400",
  },
});

export default TodayTimer;
