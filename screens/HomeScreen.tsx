import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';

//add
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import TodayTimer from '../components/HomeScreen/TodayTimer';
import ReturnSeat from '../components/HomeScreen/ReturnSeat';
import StudyList from '../components/HomeScreen/StudyList';

function HomeScreen() {

  const [subjects, setSubjects] = useState([
    { id: '0', name: '공부', time: '00:00:00', selected: true },
    { id: '1', name: '알고리즘', time: '00:00:00', selected: false },
    { id: '2', name: '자료구조', time: '00:00:00', selected: false },
  ]);

  //add
  // 좌석 ID 상태
  const [seatId, setSeatId] = useState<string | null>(null);

  // 타이머 상태
  const [isStudying, setIsStudying] = useState(false);

//로그인한 사용자 문서를 실시간 감시하여 seatId 가져오기
  useEffect(() => {
    const user = auth().currentUser;
    if (!user) return;

    const userRef = firestore().collection('users').doc(user.uid);

    const unsubscribe = userRef.onSnapshot(snapshot => {
      if (!snapshot.exists) {
        console.log("사용자 문서가 존재하지 않습니다.");
        return;
      }

      const data = snapshot.data();
      console.log("사용자 문서 변경:", data);

      setSeatId(data?.seatId ?? null);
    });

    return () => unsubscribe();
  }, []);

  //seatId가 생기면 해당 좌석 문서를 실시간 감시
  useEffect(() => {
    if (!seatId) {
      setIsStudying(false);
      return;
    }

    const seatRef = firestore().collection('seats').doc(seatId);

    const unsubscribe = seatRef.onSnapshot(snapshot => {
      if (!snapshot.exists) {
        console.log("좌석 문서가 존재하지 않습니다:", seatId);
        return;
      }

      const data = snapshot.data();
      console.log("좌석 문서 변경:", data);

      // status 값에 따라 자동 타이머 설정
      if (data?.status === "occupied") {
        setIsStudying(true);
      } else {
        setIsStudying(false);
      }
    });

    return () => unsubscribe();
  }, [seatId]);
  //여기 까지

  return (
    <View style={styles.container}>

      <TodayTimer />

      <ReturnSeat seat="1-256" />

      <StudyList subjects={subjects} setSubjects={setSubjects} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
});

export default HomeScreen;
