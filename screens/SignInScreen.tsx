import React, { useEffect, useRef, useState } from 'react';
import {Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import SignForm from '../components/SignForm';
import SignButtons from '../components/SignButton';
import {signIn, signUp} from '../lib/auth';
import { getUser, createUser } from '../lib/users';
import { useUserContext } from '../contexts/UserContext';

function SignInScreen({navigation, route}){

    const {isSignUp} = route.params || {};
    const [form, setForm] = useState(
        {   
            name: '',
            student_number: '',
            password: '',
            confirmPassword: '',
            nickname : '',
            department: '',
            goals : 0,
            isadmin : false,
            seatId : '',
            reservelog : [
                
            ],
        }
    );
    const [loading, setLoading] = useState();
    const {setUser} = useUserContext();

    const mounted = useRef(true);
        useEffect(() => {
        return () => { mounted.current = false; };
        }, []);

    const createChangeTextHandler = (name) => (value) => {
        setForm(
            {...form, [name]: value}
        );
    };

    const onSubmit = async () => {
        // Keyboard.dismiss();
        const {name, student_number, password, confirmPassword, nickname, department, goals, seatId, isadmin} = form;
        const DOMAIN = 'inha.edu';
        const email = `${String(student_number).trim()}@${DOMAIN}`;
        const info = {email, password};

        
        
        if(!name && isSignUp){
            return(
                Alert.alert('이름을 입력하세요.')
            )
        }

        if(!student_number){
            return(
                Alert.alert('학번을 입력하세요.')
            )
        }
        if(!password){
            console.log(password);
            return(
                Alert.alert('비밀번호를 입력하세요.')
            )
        }

        if(!confirmPassword && isSignUp){
            return(
                Alert.alert('비밀번호 확인을 입력하세요.')
            )
        }
        if(!nickname && isSignUp){
            return(
                Alert.alert('닉네임을 입력하세요.')
            )
        }
        if(!department && isSignUp){
            return(
                Alert.alert('학과를 입력하세요')
            )
        }
        

        if(isSignUp && (password !== confirmPassword)){
            Alert.alert('실패', '비밀번호가 일치하지 않습니다.');
            return;
        }
        setLoading(true);

        try{
            const profileExtra = isSignUp ? 
            {name, student_number, nickname, department, goals, seatId, isadmin} : undefined;

            const {user} = isSignUp ? await signUp(info)
            : await signIn(info);
            
            const profile = await getUser(user.uid);
            if(!profile && profileExtra){
                await createUser({
                    id: user.uid,
                    profileExtra: profileExtra,
                });
            }else{
                setUser(profile);
            }

            if(isSignUp){
                navigation.replace('SignIn', {isSignUp: false});
                return;
            }
            console.log(user);
        }catch(e){
            console.log(e);
            const messages = {
                'auth/email-already-in-use': '이미 가입된 학번입니다',
                'auth/invalid-credential' : '학번 또는 비밀번호가 올바르지 않습니다.',
                'auth/user-not-found' : '존재하지 않는 계정입니다.',
            };
            // 현재 Firebase 정책상, 없는 이메일, 잘못된 비밀번호 입력 시에는 모두 auth/invalid-credential로 통일됨
            // 따로 방법을 찾아야함
            const msg = messages[e.code] || `${isSignUp ? '가입' : '로그인'} 실패`;
            Alert.alert('실패', msg);
        }finally{
            setLoading(false);
        }
    }

    return(
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.select( {ios: 'padding'})}
        >
            <SafeAreaView style={styles.fullscreen}>
                <Text style={styles.text}>집중의 정석</Text>
                <View style={styles.form}>
                    <SignForm
                        isSignUp={isSignUp}
                        onSubmit={onSubmit}
                        form={form}
                        createChangeTextHandler={createChangeTextHandler}
                    />
                    <SignButtons
                        isSignUp={isSignUp}
                        onSubmit={onSubmit}
                        loading={loading}
                    />
                </View>
            </SafeAreaView>

        </KeyboardAvoidingView>
    )
    
}

const styles = StyleSheet.create({
    fullscreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 32,
        fontWeight: 'bold',
    },

    form: {
        marginTop: 64,
        width: '100%',
        paddingHorizontal: 16,
    },

    keyboardAvoidingView: {
        flex: 1,
    },
});

export default SignInScreen;