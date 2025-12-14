// screens/Sign/SignUpScreen.tsx — FINAL VERSION

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signUp } from '../../lib/auth';
import { createUser } from '../../lib/users';
import checkSignUpError from '../../components/Sign/CheckSignUpError';
import DuplicateCheck from '../../components/Sign/DuplicateCheck';
import { Picker } from '@react-native-picker/picker';
import firestore from "@react-native-firebase/firestore";
import auth from '@react-native-firebase/auth';

function SignUpScreen({ navigation }) {
    const [form, setForm] = useState({
        name: '',
        student_number: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        department: 'none',
        goals: 0,
        goalNotified: false,
        seatId: '',
        selectedSubject: '',
        isadmin: false,
        todayTotalTime: 0,
        subject: {
        base: { name: '공부', time: 0 },
        },
    });

    const [duplicateValid, setDuplicateValid] = useState({
        student_number: false,
        nickname: false,
    });

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleDuplicateResult = (type, valid) => {
        setDuplicateValid((prev) => ({ ...prev, [type]: valid }));
    };

    const handleJoin = async () => {
        const isValid = checkSignUpError(form, duplicateValid);
        if (!isValid) return;

        const email = `${String(form.student_number).trim()}@inha.edu`;

        try {

            const snap = await firestore()
                .collection("users")
                .where("student_number", "==", form.student_number)
                .get();

            if (!snap.empty) {
                Alert.alert("오류", "이미 가입된 학번입니다. 다시 입력해주세요.");
                return;
            }


        const result = await signUp({ email, password: form.password });

        if (!result?.user) {
            Alert.alert("오류", "Auth 생성 중 문제가 발생했습니다.");
            return;
        }

        const { password, confirmPassword, ...cleanForm } = form;
        cleanForm.department = cleanForm.department || "none";

        await createUser({
            id: result.user.uid,
            profileExtra: cleanForm,
        });

        Alert.alert("가입 성공", "회원가입이 완료되었습니다.");

        } catch (e) {
        const code = e?.code ?? "unknown";
        Alert.alert("회원가입 오류", `문제가 발생했습니다. (code: ${code})`);
        }
    };

    return (
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
                
                <Text style={styles.title}>회원가입</Text>

                {/* ---------------- 성명 ---------------- */}
                <TextInput
                    style={styles.input}
                    placeholder="성명 (한글 or 영어 2~40글자)"
                    value={form.name}
                    onChangeText={(v) => handleChange("name", v)}
                />

                {/* ---------------- 학번 ---------------- */}
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                    <TextInput
                        style={[styles.input, { marginBottom: 0 }]}  // ⭐ 간격 보정
                        placeholder="학번(숫자 8글자)"
                        keyboardType="number-pad"
                        value={form.student_number}
                        onChangeText={(v) => handleChange("student_number", v)}
                    />
                    </View>

                    <View style={{ justifyContent: "flex-start" }}>
                    <DuplicateCheck
                        type="student_number"
                        value={form.student_number}
                        onValid={(valid) => handleDuplicateResult("student_number", valid)}
                    />
                    </View>
                </View>

                {/* ---------------- 비밀번호 ---------------- */}
                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 (영어,숫자,특수기호 6~16글자)"
                    secureTextEntry
                    value={form.password}
                    onChangeText={(v) => handleChange("password", v)}
                />

                <TextInput
                    style={styles.input}
                    placeholder="비밀번호 확인"
                    secureTextEntry
                    value={form.confirmPassword}
                    onChangeText={(v) => handleChange("confirmPassword", v)}
                />

                {/* ---------------- 닉네임 ---------------- */}
                <View style={styles.row}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                    <TextInput
                        style={[styles.input, { marginBottom: 0 }]}  // ⭐ 간격 보정
                        placeholder="닉네임 (한,영,숫자 2~6글자)"
                        value={form.nickname}
                        onChangeText={(v) => handleChange("nickname", v)}
                    />
                    </View>

                    <View style={{ justifyContent: "flex-start" }}>
                    <DuplicateCheck
                        type="nickname"
                        value={form.nickname}
                        onValid={(valid) => handleDuplicateResult("nickname", valid)}
                    />
                    </View>
                </View>

                {/* ---------------- 학과 ---------------- */}
                <View style={styles.pickerWrapper}>
                    <Picker
                    selectedValue={form.department}
                    onValueChange={(v) => {
                        if (v === "none") return;
                        handleChange("department", v);
                    }}
                    >
                    <Picker.Item label="학과를 선택하세요" value="none" color="#999" />
                    <Picker.Item label="컴퓨터공학과" value="컴퓨터공학과" />
                    <Picker.Item label="전기공학과" value="전기공학과" />
                    <Picker.Item label="데이터사이언스학과" value="데이터사이언스학과" />
                    </Picker>
                </View>

                {/* ---------------- 가입 버튼 ---------------- */}
                <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
                    <Text style={styles.joinText}>회원가입</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
                    <Text style={styles.loginLink}>로그인으로 돌아가기</Text>
                </TouchableOpacity>

                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        marginVertical: 40,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 14,          
    },
    row: {
        flexDirection: "row",
        alignItems: "flex-start",    
        marginBottom: 14,            
    },
    joinButton: {
        backgroundColor: "#005bac",
        width: "100%",
        paddingVertical: 14,
        borderRadius: 6,
        alignItems: "center",
        marginTop: 8,
    },
    joinText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    loginLink: {
        marginTop: 16,
        fontSize: 15,
        color: "#005bac",
        textAlign: "center",
        fontWeight: "600",
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        marginBottom: 14,            
    },
});

export default SignUpScreen;
