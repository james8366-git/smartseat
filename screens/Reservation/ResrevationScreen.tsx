import React from 'react';
import { View, Text, StyleSheet, Button, Alert} from 'react-native';
import { useUserContext } from '../../contexts/UserContext';


function ReservationScreen() {
  const { user } = useUserContext();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>예약</Text>
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center',  backgroundColor: '#FFFFFF' },
  text: { fontSize: 20, marginBottom: 20 },
});


export default ReservationScreen;
