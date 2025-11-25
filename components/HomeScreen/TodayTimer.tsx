import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useUserContext } from '../../contexts/UserContext';
import firestore from "@react-native-firebase/firestore";
import { getTodayTotalTime } from "../../lib/studylogs";

function TodayTimer() {
  const { user } = useUserContext();
  const [time, setTime] = useState("00:00");

  const intervalRef = useRef(null);
  const seatUnsubRef = useRef(null);

  const formatTime = min => {
    const h = String(Math.floor(min / 60)).padStart(2, "0");
    const m = String(min % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const startRealTimeTimer = (baseMinutes, occupiedAt) => {
    stopTimer();

    intervalRef.current = setInterval(() => {
      const diffMin = Math.floor((Date.now() - occupiedAt.toMillis()) / 1000 / 60);
      setTime(formatTime(baseMinutes + diffMin));
    }, 1000);
  };

  /* ---------------------------------------
   * user.seatId → seats 문서 실시간 구독
   --------------------------------------- */
  useEffect(() => {
    if (!user?.uid) return;

    const userRef = firestore().collection("users").doc(user.uid);

    const unsubUser = userRef.onSnapshot(async snap => {
      const seatId = snap.data()?.seatId;

      if (seatUnsubRef.current) {
        seatUnsubRef.current(); // 기존 seats 구독 해제
        seatUnsubRef.current = null;
      }

      if (!seatId) {
        stopTimer();
        setTime("00:00");
        return;
      }

      const seatRef = firestore().collection("seats").doc(seatId);

      seatUnsubRef.current = seatRef.onSnapshot(async seatSnap => {
        const seat = seatSnap.data();
        const baseMin = await getTodayTotalTime(user.uid);

        if (seat.status === "occupied" && seat.occupiedAt) {
          startRealTimeTimer(baseMin, seat.occupiedAt);
        } else {
          stopTimer();
          setTime(formatTime(baseMin));
        }
      });
    });

    return () => {
      unsubUser();
      if (seatUnsubRef.current) seatUnsubRef.current();
      stopTimer();
    };
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.text}>{time}</Text>
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
