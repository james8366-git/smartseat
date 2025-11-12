import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import TodayTimer from '../components/HomeScreen/TodayTimer';
import ReturnSeat from '../components/HomeScreen/ReturnSeat';
import StudyList from '../components/HomeScreen/StudyList';

function HomeScreen() {

  const [subjects, setSubjects] = useState([
    { id: '0', name: '공부', time: '00:00:00', selected: true },
    { id: '1', name: '알고리즘', time: '00:00:00', selected: false },
    { id: '2', name: '자료구조', time: '00:00:00', selected: false },
  ]);

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
