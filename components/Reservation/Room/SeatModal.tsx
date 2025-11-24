// components/Reservation/Room/SeatModal.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useUserContext } from '../../../contexts/UserContext';
import { useSelectedSubject } from '../../../contexts/SelectedSubjectContext';

function SeatModal({ visible, onClose, seat, roomName, navigation }) {
  const { user } = useUserContext();
  const { selectedSubject } = useSelectedSubject();

  if (!seat) return null;

  const seatLabel = `${roomName} ${seat.seat_number}번`;

  const handleReserve = async () => {
    if (!user) {
      Alert.alert('오류', '로그인 정보가 없습니다.');
      return;
    }

    if (!selectedSubject) {
      Alert.alert('오류', '먼저 홈 화면에서 과목을 선택해주세요.');
      return;
    }

    if (user.seatId && user.seatId !== '') {
      Alert.alert('이미 자리를 예약하셨습니다.');
      return;
    }

    const seatRef = firestore().collection('seats').doc(seat.id);
    const userRef = firestore().collection('users').doc(user.uid);
    const studyRef = firestore().collection('studylogs').doc(user.uid);

    const now = new Date();
    const HH = now.getHours().toString().padStart(2, "0");
    const MM = now.getMinutes().toString().padStart(2, "0");
    const reservedSt = `${HH}:${MM}`;

    // 6시간 뒤 자동반납 시간
    const end = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const HH2 = end.getHours().toString().padStart(2, "0");
    const MM2 = end.getMinutes().toString().padStart(2, "0");
    const reservedEd = `${HH2}:${MM2}`;

    try {
      await firestore().runTransaction(async tx => {
        const seatSnap = await tx.get(seatRef);
        const seatData = seatSnap.data();

        if (!seatSnap.exists || seatData.status !== 'none') {
          throw new Error('이미 선점된 자리입니다.');
        }

        // 1) seats 업데이트 — 예약 상태는 empty(착석 전)
        tx.update(seatRef, {
          status: "empty",
          reservedSt,
          reservedEd,
          student_number: user.student_number,
          lastSeated: now,
          seatId: seat.seatId,
        });

        // 2) users 업데이트
        tx.update(userRef, {
          seatId: seat.seatId,
        });

        // 3) studylogs 생성/갱신
        tx.set(
          studyRef,
          {
            uid: user.uid,
            lastSeated: now,
            occupiedAt: now,
            seatId: seat.seatId,
            student_number: user.student_number,
            totalTime: 0,
            subject: [
              {
                subjectName: selectedSubject,
                studyTime: '0',
              },
            ],
          },
          { merge: true },
        );
      });

      Alert.alert('예약이 완료되었습니다.');
      onClose();
      navigation.navigate('HomeStack', { screen: 'Home' });

    } catch (e: any) {
      if (e.message === '이미 선점된 자리입니다.') {
        Alert.alert('오류', '이미 선점된 자리입니다.');
      } else {
        console.log(e);
        Alert.alert('오류', '예약 중 문제가 발생했습니다.');
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>좌석예약</Text>
          <Text style={styles.label}>{seatLabel}</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.button} onPress={handleReserve}>
              <Text style={styles.btnText}>예약</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#999' }]}
              onPress={onClose}
            >
              <Text style={styles.btnText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default SeatModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  box: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  title: { fontSize: 18, marginBottom: 10, fontWeight: '600' },
  label: { fontSize: 16, marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 10 },
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#5A8DEE',
    width: '40%',
    alignItems: 'center',
  },
  btnText: { color: 'white', fontWeight: 'bold' },
});
