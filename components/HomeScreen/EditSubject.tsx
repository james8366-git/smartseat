// EditSubject.tsx — FINAL VERSION (CSS 변경 없음)

import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function EditSubject({
  visible,
  setVisible,
  editingSubject,
  newName,
  setNewName,
  subjects,
  syncToFirestore,
}) 
{
    if (!editingSubject) return null;

    const onSave = async () => {
        const updated = subjects.map((s) =>
            s.id === editingSubject.id ? { ...s, name: newName } : s
        );

        await syncToFirestore(updated);
        setVisible(false);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.box}>
                <Text style={styles.title}>과목 수정</Text>

                <TextInput
                    style={styles.input}
                    value={newName}
                    onChangeText={setNewName}
                />

                <View style={styles.row}>
                    <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
                        <Text style={styles.saveText}>저장</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveBtn, { backgroundColor: "#bbb" }]}
                        onPress={() => setVisible(false)}
                    >
                        <Text style={styles.saveText}>취소</Text>
                    </TouchableOpacity>
                </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 20,
  },
  saveBtn: {
    backgroundColor: "#5A8DEE",
    padding: 10,
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "600" },
});
