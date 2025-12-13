/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootStack from './screens/RootStack';
import { UserContextProvider } from './contexts/UserContext';
import { SelectedSubjectProvider } from './contexts/SelectedSubjectContext';

import messaging from "@react-native-firebase/messaging";
import notifee, {AndroidImportance} from "@notifee/react-native";


LogBox.ignoreLogs([
  "Require cycle:",
  "Non-serializable values",
  "Open debugger to view warnings",
]);

function App(){

        useEffect(() => {
    async function setupNotificationChannel() {
        await notifee.createChannel({
        id: "default",
        name: "기본 알림",
        importance: AndroidImportance.HIGH,
        });
    }

    setupNotificationChannel();
    }, []);

    useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
        await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
            channelId: "default",
        },
        });
    });

    return unsubscribe;
    }, []);

  return(
    <UserContextProvider>
        <SelectedSubjectProvider>
            <NavigationContainer>
                <RootStack/>
            </NavigationContainer>
        </SelectedSubjectProvider>
    </UserContextProvider>
    
  ) 
}

export default App;

// import {Alert, Button, View} from 'react-native';
// import Toast from 'react-native-toast-message';


// function App() {
//       console.log("1");
//   return (
//       Toast.show({
//       type: 'error',
//       text1: '실패',
//       text2: '비밀번호가 일치하지 않습니다.',
//     })
//   );
// }

// export default App;