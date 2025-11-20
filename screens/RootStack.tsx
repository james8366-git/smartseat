// RootStack.tsx
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
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

  useEffect(() => {
    const unsubscribe = subscribeAuth(async (currentUser) => {
      if (currentUser) {
        const profile = await getUser(currentUser.uid);
        if (profile) {
          setUser(profile);
        }
      } else {
        setUser(null);
      }
      setInitializing(false);
    });
    return unsubscribe;
  }, [setUser]);

  if (initializing) return <View />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user && (
        <>
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      )}

      {user && user.isadmin === true && (
        <Stack.Screen name="AdminStack" component={AdminStack} />
      )}

      {user && user.isadmin === false && (
        <Stack.Screen name="MainTab" component={MainTab} />
      )}
    </Stack.Navigator>
  );
}

export default RootStack;
