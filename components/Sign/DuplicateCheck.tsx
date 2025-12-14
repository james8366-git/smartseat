// components/Sign/DuplicateCheck.tsx

import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import firestore from "@react-native-firebase/firestore";

export default function DuplicateCheck({ type, value, onValid }) {
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        if (!value || value.trim().length === 0) {
            Alert.alert("오류", "값을 입력해주세요.");
            return;
        }

        setLoading(true);

        try {
        const snap = await firestore()
            .collection("users")
            .where(type, "==", value)
            .get();

        const exists = !snap.empty;
        onValid(!exists);

        if (exists) {
            Alert.alert("중복 확인", "이미 사용 중입니다.");
        } else {
            Alert.alert("사용 가능", "사용 가능한 값입니다.");
        }
        } catch (e) {
            Alert.alert("오류", "중복 확인 중 문제가 발생했습니다.");
            console.log("DuplicateCheck ERROR:", e);
        }

        setLoading(false);
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handleCheck}>
        {loading ? (
            <ActivityIndicator size="small" color="#005bac" />
        ) : (
            <Text style={styles.text}>중복확인</Text>
        )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 48,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: "#005bac",
        borderRadius: 6,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#E8F0FE",
    },
    text: {
        fontWeight: "600",
        color: "#005bac",
        fontSize: 15,
        lineHeight: 18,
    },
});
