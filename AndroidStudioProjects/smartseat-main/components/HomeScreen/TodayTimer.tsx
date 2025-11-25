import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUserContext } from '../../contexts/UserContext';
import { getTodayTotalTime } from '../../lib/studylogs';

function TodayTimer() {
    const { user } = useUserContext();
    const [time, setTime] = useState("00:00");

    const intervalRef = useRef(null);

    const formatTime = (minutes: number) => {
        const h = String(Math.floor(minutes / 60)).padStart(2, "0");
        const m = String(minutes % 60).padStart(2, "0");
        return `${h}:${m}`;
    };

    const startRealTimeTimer = (initialMinutes, occupiedAt) => {
        // 기존 interval 제거
        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
          const now = new Date().getTime();
          const start = occupiedAt.toMillis();
          const diffMs = now - start; // 착석 후 경과시간

          const diffMinutes = Math.floor(diffMs / 1000 / 60);

          setTime(formatTime(initialMinutes + diffMinutes));
        }, 1000);
      };

      const stopTimer = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      };

    useEffect(() => {
        if (!user?.uid) return;

        const userDocRef = firestore().collection("users").doc(user.uid);

        //user문서에서 seatId 가져오기
        const unsubscribeUser = userDocRef.onSnapshot(async (userSnap) => {
            const userData = userSnap.data();
            const seatId = userData?.seatId;

            if (!seatId) {
                stopTimer();
                setTime("00:00");
                return;
            }

            //seats 문서 변화 감지
            const seatRef = firestore().collection("seats").doc(seatId);

            seatRef.onSnapshot(async(seatSnap) => {
                const seat = seatSnap.data();
                const status = seat?.status;

                //누적 시간 가져오기
                const baseMinutes = await getTodayTotalTime(user.uid);

                if(status === "occupied"){
                    startRealTimeTimer(baseMinutes, seat.occupiedAt);
                }else{
                    stopTimer();
                    setTime(formatTime(baseMinutes));
                }
            });
        });
        return () => {
            unsubscribeUser();
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
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#E6F0FF', 
        height: '60%',
    },
    
    circle: {
        width: 275, 
        height: 275, 
        borderRadius: 200, 
        borderWidth: 10, 
        borderColor: '#5A8DEE',
        backgroundColor: 'white', 
        alignItems: 'center', 
        justifyContent: 'center',
    },

    text: { 
        fontSize: 60, 
        color: '#828282', 
        fontWeight: '400',
    },
});

export default TodayTimer;
