import React, { useEffect, useState } from 'react';
import { View, Text} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import SignInScreen from './SignInScreen'
// import WelcomeScreen from './WeclomeScreen';
import { useUserContext } from '../contexts/UserContext';
import MainTab from './MainTab';
import { getUser } from '../lib/users';
import { subscribeAuth } from '../lib/auth';
// import UploadScreen from './UploadScreen';
import SignInScreen from './SignInScreen';

const Stack = createNativeStackNavigator();

function RootStack() {
    const {user, setUser} = useUserContext();
    const [initializing, setInitializing] = useState(true);

    useEffect(
        () =>{
            const unsubscribe = subscribeAuth(
                async currentUser => {
                    // 컴포넌트 첫 로딩 시 로그인 상태 확인하고 userContext에 적용
                    // 여기에 등록한 함수는 사용자 정보가 바뀔 때마다 호출, 처음 호출 될 때 바로 unsubscribe해, 한번 호출된 후에는 더 이상 호출 하지 않게함
                    if(currentUser){
                        const profile = await getUser(currentUser.uid);
                            if(profile){
                                setUser(profile);
                            }   
                    }
                    else{
                        setUser(null);
                    }
                    setInitializing(false);
                }
            );

            return unsubscribe;
        }, [setUser]
    )

    if(initializing){
        return(
            <View>

            </View>
        )
    }
    console.log(user);
    return(
    <Stack.Navigator
        screenOptions={
            {headerShown: false}
        }
        initialRouteName={
            user? "MainTab" : 'SignIn'
        }
    >
        {
            user? (
                <>
                    <Stack.Screen
                        name="MainTab"
                        component={MainTab}
                        options={
                            {headerShown:false}
                        }
                    />          
                </>
            ) : (
                <>
                    <Stack.Screen
                        name="SignIn"
                        component={SignInScreen}
                        options={
                            {headerShown: false}
                        }
                    />              
                </>
            )
        }
    </Stack.Navigator>
    )
}

export default RootStack;