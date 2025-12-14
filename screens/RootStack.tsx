import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUserContext } from "../contexts/UserContext";
import { subscribeAuth } from "../lib/auth";
import { getUser } from "../lib/users";
import firestore from "@react-native-firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";

import SignInScreen from "./Sign/SignInScreen";
import SignUpScreen from "./Sign/SignUpScreen";
import MainTab from "./MainTab";
import AdminStack from "./Admin/AdminStack";

const Stack = createNativeStackNavigator();

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
    );
    }

    function AppStack({ isadmin }) {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isadmin ? (
            <Stack.Screen name="AdminStack" component={AdminStack} />
        ) : (
            <Stack.Screen name="MainTab" component={MainTab} />
        )}
        </Stack.Navigator>
    );
    }

    export default function RootStack() {
        const { user, setUser } = useUserContext();
        const [initializing, setInitializing] = useState(true);

        useEffect(() => {
            const unsub = subscribeAuth(async (currentUser) => {
            if (currentUser) {
                const profile = await getUser(currentUser.uid);
                setUser(profile ?? null);
            } else {
                setUser(null);
            }
            setInitializing(false);
            });
            return unsub;
        }, []);

        useEffect(() => {
        if (!user?.uid) return;

        const userRef = firestore().collection("users").doc(user.uid);

        // 오늘 stat.daily 생성을 위한 dummy write
        userRef.set(
            {
                lastOpenedAt: firestore.FieldValue.serverTimestamp()
            },
            { merge: true }
        );
        }, [user?.uid]);

        if (initializing) {
            return (
            <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }} edges={["top", "bottom"]}>
            <ActivityIndicator size="large" color="#5A8DEE" />
            </SafeAreaView>
            );
        }

        return (
            <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
                {!user ? <AuthStack /> : <AppStack isadmin={user.isadmin} />}
            </SafeAreaView>
        );
}
