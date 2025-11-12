import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useUserContext } from "../../contexts/UserContext";
import { signOut } from "../../lib/auth";

function SettingsScreen() {
    const { user, setUser} = useUserContext();
    const [showTimerModal, setShowTimerModal] = useState(false);
    const [selectedTime, setSelectedTime] = useState("00:00");

    const timerOptions = [];
    for (let h = 0; h <= 2; h++) {
        for (let m = 0; m < 60; m += 10) {
        if (h === 2 && m > 0) {
            break;
        } // 2:00까지만
        const formatted = `${h.toString().padStart(2, "0")}:${
            m.toString().padStart(2, "0")}`;
            timerOptions.push(formatted);
        }
    }

    const selectTimer = (time) => {
        setSelectedTime(time);
        setShowTimerModal(false);
    };

    const handleLogout = async () => {
        try {
            await signOut();
            setUser(null);
        } catch (error) {
            Alert.alert("오류", "로그아웃 중 문제가 발생했습니다.");
        }
    };

    return (
        <View style={styles.container}>
        {/* 상단 제목 */}
            <Text style={styles.headerText}>설정</Text>

            {/* 닉네임 변경 */}
            <View style={styles.row}>
                <Text style={styles.label}>닉네임</Text>
                <View style={styles.rightGroup}>
                <Text style={styles.value}>{user?.nickname || "닉네임"}</Text>
                    <TouchableOpacity style={styles.changeButton}>
                        <Text style={styles.changeText}>변경</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 포모도로 타이머 설정 */}
            <View style={styles.row}>
                <Text style={styles.label}>포모도로 타이머</Text>
                <TouchableOpacity
                    style={styles.rightGroup}
                    onPress={() => setShowTimerModal(true)}
                >
                    <Text style={styles.value}>{selectedTime}</Text>
                    <Icon name="arrow-drop-down" size={26} color="#333" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>로그아웃</Text>
            </TouchableOpacity>

            {/* 타이머 선택 모달 */}
            <Modal visible={showTimerModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>포모도로 시간 설정</Text>
                        <FlatList
                            data={timerOptions}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={
                                        [
                                            styles.timerItem,
                                            item === selectedTime && styles.selectedItem,
                                        ]
                                    }
                                    onPress={() => selectTimer(item)}
                                >
                                    <Text
                                        style={
                                            [
                                                styles.timerText,
                                                item === selectedTime && styles.selectedText,
                                            ]
                                        }
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowTimerModal(false)}
                        >
                            <Text style={styles.closeText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

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
        marginBottom: 20,
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
        color: "#555",
    },
    rightGroup: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    value: {
        fontSize: 16,
        color: "#333",
    },
    changeButton: {
        backgroundColor: "#eee",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    changeText: {
        fontSize: 14,
        color: "#555",
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
    
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        width: "80%",
        height: "70%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 10,
    },
    timerItem: {
        paddingVertical: 10,
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    timerText: {
        fontSize: 18,
        color: "#333",
    },
    selectedItem: {
        backgroundColor: "#D3E3FF",
    },
    selectedText: {
        color: "#005bac",
        fontWeight: "bold",
    },
    closeButton: {
        backgroundColor: "#005bac",
        paddingVertical: 10,
        borderRadius: 6,
        marginTop: 10,
    },
    closeText: {
        color: "white",
        textAlign: "center",
        fontWeight: "600",
        fontSize: 16,
    },
});

export default SettingsScreen;
