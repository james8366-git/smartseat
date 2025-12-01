// AddSubject.tsx — FINAL (subjects는 직접 set 하지 않음)
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import uuid from "react-native-uuid";
import { updateSubjects } from "../../lib/users";
import { useUserContext } from "../../contexts/UserContext";

function AddSubject({ subjects }) {
  const { user } = useUserContext();

  const add = async () => {
    if (!user?.uid) return;

    const newId = uuid.v4();

    const newItem = {
      id: newId,
      name: "새 과목",
      time: 0,
    };

    const updated = [...subjects, newItem];

    // ❌ setSubjects(updated) 제거 (중복 갱신 → 깜빡임 원인)
    await updateSubjects(user.uid, updated);

    // ✔ HomeScreen user snapshot이 알아서 subjects를 다시 불러온다.
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
