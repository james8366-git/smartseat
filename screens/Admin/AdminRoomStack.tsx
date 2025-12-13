// AdminRoomStack.tsx — FINAL

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminPlaceScreen from "./AdminPlaceScreen";
import AdminRoomScreen from "./AdminRoomScreen";

const Stack = createNativeStackNavigator();

export default function AdminRoomStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminPlaceScreen" component={AdminPlaceScreen} />
      <Stack.Screen name="AdminRoomScreen" component={AdminRoomScreen} />
    </Stack.Navigator>
  );
}
