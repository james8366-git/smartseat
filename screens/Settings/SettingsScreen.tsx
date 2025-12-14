import React, { useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert 
} from "react-native";
import { useUserContext } from "../../contexts/UserContext";
import firestore from "@react-native-firebase/firestore";
import { signOut } from "../../lib/auth";
import { useNavigation } from "@react-navigation/native";


function SettingsScreen() {
  const { user, setUser } = useUserContext();
  const navigation = useNavigation();

  //  닉네임 변경 관련 state
  const [nicknameModal, setNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.nickname || "");

  /** 닉네임 변경 처리 */
  const handleNicknameChange = async () => {
    if (!newNickname.trim()) {
      Alert.alert("입력 오류", "닉네임을 입력해주세요.");
      return;
    }
    if (newNickname.length < 2 || newNickname.length > 8) {
      Alert.alert("입력 오류", "닉네임은 2~8글자여야 합니다.");
      return;
    }

    try {
      await firestore()
        .collection("users")
        .doc(user.uid)
        .update({ nickname: newNickname });

      setUser(prev => ({ ...prev, nickname: newNickname }));

      Alert.alert("성공", "닉네임이 변경되었습니다.");
      setNicknameModal(false);

      navigation.navigate("HomeStack", { screen: "Home" });
    } catch (e) {
      console.log("닉네임 변경 오류:", e);
      Alert.alert("오류", "닉네임 변경 중 문제가 발생했습니다.");
    }
  };

  /** 로그아웃 */
  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch {
      Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>설정</Text>

      {/* 닉네임 변경 */}
      <View style={styles.row}>
        <Text style={styles.label}>닉네임</Text>
        <View style={styles.rightGroup}>
          <Text style={styles.value}>{user?.nickname}</Text>

          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setNicknameModal(true)}
          >
            <Text style={styles.changeText}>변경</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/*  닉네임 변경 Modal */}
      <Modal visible={nicknameModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.nicknameBox}>
            <Text style={styles.modalTitle}>닉네임 변경</Text>

            <TextInput
              style={styles.input}
              placeholder="새 닉네임"
              value={newNickname}
              onChangeText={setNewNickname}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleNicknameChange}>
              <Text style={styles.saveText}>저장</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setNicknameModal(false)}
            >
              <Text>취소</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 로그아웃 */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>

    </View>
  );
}

/* ================= 스타일 ================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        paddingTop: 50,
    },
    headerText: { 
        fontSize: 22, 
        fontWeight: "bold", 
        marginBottom: 20 
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "90%",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 4,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 12,
    },

    label: { 
        fontSize: 16, 
        color: "#555" 
    },
    rightGroup: { 
        flexDirection: "row", 
        alignItems: "center", 
        gap: 10 
    },
    value: { 
        fontSize: 16, 
        color: "#333" 
    },

    changeButton: {
        backgroundColor: "#eee",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    changeText: { 
        fontSize: 14, 
        color: "#555" 
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    nicknameBox: {
        width: "80%",
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 12,
    },

    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
    },

    saveButton: {
        backgroundColor: "#5A8DEE",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    saveText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },

    cancelButton: {
        marginTop: 10,
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: "#eee",
        borderRadius: 8,
    },

    logoutButton: {
        marginTop: 30,
        backgroundColor: "#d9534f",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    logoutText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});

export default SettingsScreen;
