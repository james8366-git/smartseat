import React from "react";
import { Image, StyleSheet, Text, View} from "react-native";
import { useUserContext } from "../contexts/UserContext";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeStack from "./HomeStack";
// import MyProfileStack from "./MyProfileStack";
import Icon from 'react-native-vector-icons/MaterialIcons';
// import CameraButton from "../components/CameraButton";

const Tab = createBottomTabNavigator();

function MainTab(){
    const {user} = useUserContext();

    return(
        // <View style={styles.block}>
        //     {
        //         user.photoURL && (
        //             <Image
        //                 source={
        //                     {uri: user.photoURL}
        //                 }
        //                 style={
        //                     {width: 128, height: 128, marginBottom: 16}
        //                 }
        //                 resizeMode="cover"
        //             />
        //         )
        //     }
        //     <Text style={styles.text}>
        //         Hello, {user.displayName}
        //     </Text>
        // </View>

        <>
            <View style={styles.block}>
                <Tab.Navigator
                    screenOptions={
                        {
                            headerShown: false,
                            tabBarShowLabel: false,
                            tabBarActiveTintColor: '#005bac',
                        }
                    }
                >

                    <Tab.Screen
                        name="HomeStack"
                        component={HomeStack}
                        options={
                            {
                                tabBarIcon: ({color}) => (
                                    <Icon name="home" size={24} color={color}/>
                                ),
                            }
                        }
                    />
                </Tab.Navigator>
            </View>       
        </>


    )
}

const styles = StyleSheet.create({
    block:{
        flex: 1,
        zIndex: 0,
    },

    text:{
        fontSize: 24,
    },
})

export default MainTab;