// components/HomeScreen/EditSubject.tsx
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";

export default function EditSubject({
  visible,
  setVisible,
  editingSubject,
  newName,
  setNewName,
  subjects,
  setSubjects,
  syncToFirestore,
}) {
  const { user } = useUserContext();

  if (!editingSubject) return null;

  const isBase = editingSubject.id === "base";

  /* -------------------------------------------------------
   * 저장 처리
   * ------------------------------------------------------- */
  const handleSave = async () => {
    if (isBase) return;

    /** 1) subject 배열에서 이름 변경 */
    const updated = subjects.map((s) =>
      s.id === editingSubject.id ? { ...s, name: newName } : s
    );

    setSubjects(updated);

    /** 2) 만약 현재 선택한 과목이라면 selectedSubject도 변경 */
    if (user.selectedSubject === editingSubject.name) {
      await firestore()
        .collection("users")
        .doc(user.uid)
        .update({
          selectedSubject: newName, // 선택된 과목 이름도 변경
        });
    }

    /** 3) Firestore에 subject 맵 저장 */
    await syncToFirestore(updated);

    setVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          {/* ---------------------------------------------------
           * base 과목은 수정 불가
           * --------------------------------------------------- */}
          {isBase ? (
            <>
              <Text style={styles.title}>‘공부’ 과목은 수정할 수 없습니다.</Text>

              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={() => setVisible(false)}
              >
                <Text style={styles.closeText}>닫기</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>과목 이름 변경</Text>

              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="과목 이름"
              />

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.button, styles.cancel]}
                  onPress={() => setVisible(false)}
                >
                  <Text>취소</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.save]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveText}>저장</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  box: {
    width: "75%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },

  cancel: {
    backgroundColor: "#eee",
  },
  save: {
    backgroundColor: "#5A8DEE",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },

  closeButton: {
    marginTop: 10,
    backgroundColor: "#5A8DEE",
  },
  closeText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
});
