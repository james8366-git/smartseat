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
import DuplicateCheck from '../../components/SignIn/DuplicateCheck';

function SignUpScreen({ navigation }) {
    const [form, setForm] = useState({
        name: '',
        student_number: '',
        password: '',
        confirmPassword: '',
        nickname: '',
        department: '',
        goals: 0,
        seatId: '',
        reservelog: [],
        isadmin: false,
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
        // ✅ 전체 검증
        const isValid = checkSignUpError(form, duplicateValid);
        if (!isValid) return;

        const { student_number, password } = form;
        const DOMAIN = 'inha.edu';
        const email = `${String(student_number).trim()}@${DOMAIN}`;

        try {
        const { user } = await signUp({ email, password });
        await createUser({ id: user.uid, profileExtra: form });
        Alert.alert('가입 성공', '회원가입이 완료되었습니다.');
        navigation.replace('SignIn');
        } catch (e) {
        console.log(e);
        Alert.alert('오류', '회원가입 중 문제가 발생했습니다.');
        }
    };

    return (
        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
            <Text style={styles.title}>회원가입</Text>

            <TextInput
                style={styles.input}
                placeholder="성명 (한글 or 영어 2~40글자)"
                value={form.name}
                onChangeText={(v) => handleChange('name', v)}
            />

            <View style={styles.row}>
                <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="학번(숫자 8글자)"
                keyboardType="number-pad"
                value={form.student_number}
                onChangeText={(v) => handleChange('student_number', v)}
                />
                <DuplicateCheck
                type="student_number"
                value={form.student_number}
                onValid={(valid) => handleDuplicateResult('student_number', valid)}
                />
            </View>

            <TextInput
                style={styles.input}
                placeholder="비밀번호 (영어,숫자,특수기호 4~12글자)"
                secureTextEntry
                value={form.password}
                onChangeText={(v) => handleChange('password', v)}
            />

            <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                secureTextEntry
                value={form.confirmPassword}
                onChangeText={(v) => handleChange('confirmPassword', v)}
            />

            <View style={styles.row}>
                <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                placeholder="닉네임 (한,영,숫자 2~6글자)"
                value={form.nickname}
                onChangeText={(v) => handleChange('nickname', v)}
                />
                <DuplicateCheck
                type="nickname"
                value={form.nickname}
                onValid={(valid) => handleDuplicateResult('nickname', valid)}
                />
            </View>

            <TextInput
                style={styles.input}
                placeholder="학과"
                value={form.department}
                onChangeText={(v) => handleChange('department', v)}
            />

            <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
                <Text style={styles.joinText}>회원가입</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
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
        backgroundColor: '#fff',
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginVertical: 40,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 14,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    joinButton: {
        backgroundColor: '#005bac',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 8,
    },
    joinText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 16,
        fontSize: 15,
        color: '#005bac',
        textAlign: 'center',
        fontWeight: '600',
    },
});

export default SignUpScreen;
