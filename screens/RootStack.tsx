// RootStack.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUserContext } from '../contexts/UserContext';
import { getUser } from '../lib/users';
import { subscribeAuth } from '../lib/auth';

import MainTab from './MainTab';
import SignInScreen from './Sign/SignInScreen';
import SignUpScreen from './Sign/SignUpScreen';
import AdminStack from './Admin/AdminStack';

const Stack = createNativeStackNavigator();

function RootStack() {
  const { user, setUser } = useUserContext();
  const [initializing, setInitializing] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  // 🔥 1) Firebase Auth 상태 구독
  useEffect(() => {
    const unsubscribe = subscribeAuth(async (currentUser) => {
      if (currentUser) {
        const profile = await getUser(currentUser.uid);

        if (profile) {
          setUser(profile);
        } else {
          // user doc 생성될 때까지 기다림
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  // 🔥 2) user가 바뀔 때 로딩 체크
  useEffect(() => {
    if (user === undefined) return;
    setLoadingUser(false);
  }, [user]);

  // 🔥 초기 로딩 화면
  if (initializing || loadingUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5A8DEE" />
      </View>
    );
  }

  // 🔥 user 객체가 존재하는지 안전하게 체크
  const isAdmin = user?.isadmin === true;
  const isUser = user?.isadmin === false;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* 로그인 안한 유저 */}
      {!user && (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}

      {/* 관리자 */}
      {isAdmin && (
        <Stack.Screen name="AdminStack" component={AdminStack} />
      )}

      {/* 일반 사용자 */}
      {isUser && (
        <Stack.Screen name="MainTab" component={MainTab} />
      )}
    </Stack.Navigator>
  );
}

export default RootStack;
