import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReservationScreen from './ResrevationScreen';

const Stack = createNativeStackNavigator();

function ReservationStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Reservation" component={ReservationScreen} />
    </Stack.Navigator>
  );
}

export default ReservationStack;
