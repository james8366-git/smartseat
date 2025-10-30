import React from 'react';
import { View, Text, StyleSheet, Button, Alert} from 'react-native';
import {signOut} from '../lib/auth';
import {useUserContext} from '../contexts/UserContext' ;


function HomeScreen() {
  const { user } = useUserContext();
  const onLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error(e);
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>환영합니다, {user?.nickname || '사용자'}님!</Text>
      <Button title="로그아웃" onPress={onLogout} color="#e74c3c" />
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, marginBottom: 20 },
});


export default HomeScreen;
