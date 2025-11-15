import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import TodayTimer from "../components/HomeScreen/TodayTimer";
import ReturnSeat from "../components/HomeScreen/ReturnSeat";
import StudyList from "../components/HomeScreen/StudyList";
import { useUserContext } from "../contexts/UserContext";
import { getSubjects } from "../lib/users";

function HomeScreen() {
  const { user } = useUserContext();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      const loaded = await getSubjects(user.id);
      setSubjects(loaded);
    };

    load();
  }, [user]);

  return (
    <View style={styles.container}>
      <TodayTimer />
      <ReturnSeat seat="1-256" />
      <StudyList subjects={subjects} setSubjects={setSubjects} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
});

export default HomeScreen;
