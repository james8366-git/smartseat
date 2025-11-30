import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import uuid from "react-native-uuid";               // ★ 변경된 부분
import { updateSubjects } from "../../lib/users";
import { useUserContext } from "../../contexts/UserContext";

function AddSubject({ subjects, setSubjects }) {
  const { user } = useUserContext();

  const add = async () => {
    if (!user?.uid) return;

    const newId = uuid.v4();                       // ★ uuidv4() → uuid.v4()

    const newItem = {
      id: newId,
      name: "새 과목",
      selected: false,
      time: 0,
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
