import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { updateSubjects } from "../../lib/users";
import { useUserContext } from "../../contexts/UserContext";

function AddSubject({ subjects, setSubjects }) {
  const { user } = useUserContext();

  const add = async () => {
    const newItem = {
      id: subjects.length.toString(),  // index 기반
      name: "새 과목",
      time: "00:00:00",
      selected: false,
    };

    const updated = [...subjects, newItem];

    setSubjects(updated);
    await updateSubjects(user.uid, updated);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={add}>
      <Text style={styles.text}>+ 과목 추가하기</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 16, backgroundColor: "white" },
  text: { color: "#5A8DEE", fontWeight: "500" },
});

export default AddSubject;
