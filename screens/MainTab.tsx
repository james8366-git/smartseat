import React from "react";
import { StyleSheet, View, Platform, PixelRatio} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useUserContext } from "../contexts/UserContext";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeStack from "./HomeStack";
import Icon from 'react-native-vector-icons/MaterialIcons';

import ReservationStack from "./Reservation/ReservationStack";
import RankStack from "./Rank/RankStack";
import CalendarStack from "./Calendar/CalendarStack";
import ProfileStack from "./Profile/ProfileStack";

const Tab = createBottomTabNavigator();

function MainTab(){
    const {user} = useUserContext();

    const ICONSIZE = Math.round(24 * PixelRatio.getFontScale());

    return(
        <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={["bottom"]}>
            <View style={styles.block}>
                <Tab.Navigator
                    screenOptions={
                        {
                            headerShown: false,
                            tabBarShowLabel: false,
                            tabBarActiveTintColor: '#000000', 
                            tabBarInactiveTintColor: '#C0C0C0',
                            tabBarStyle: {
                                backgroundColor: '#FFFFFF',
                                borderTopWidth: 0.5,
                                borderTopColor: '#E0E0E0',
                                paddingBottom: Platform.OS === 'ios' ? 20 : 6,
                                height: Platform.OS === 'ios' ? 80 : 60,
                                paddingTop: 6,
                            },
                        }
                    }
                >

                    <Tab.Screen
                        name="HomeStack"
                        component={HomeStack}
                        options={
                            {
                                tabBarIcon: ({color}) => (
                                    <Icon name="home" size={ICONSIZE} color={color}/>
                                ),
                            }
                        }
                    />

                    <Tab.Screen
                        name="ReservationStack"
                        component={ReservationStack}
                        options={{
                            tabBarIcon: (
                                { color }) => 
                                (
                                    <Icon name="chair-alt" size={ICONSIZE} color={color} />
                                ),
                            }
                        }
                        listeners=
                        {
                            ({ navigation }) => 
                            (
                                {
                                    tabPress: (e) => {
                                    e.preventDefault();  // 기본 동작 막기
                                    navigation.navigate("ReservationStack",
                                            {
                                                screen: "Place",    // 🔥 ReservationStack 내 첫 화면 강제 이동
                                            }
                                        );
                                    },
                                }
                            )
                        }
                    />
                    <Tab.Screen
                        name="RankStack"
                        component={RankStack}
                        options = {
                            {
                                tabBarIcon: ({color}) => (
                                    <Icon name="bar-chart" size={ICONSIZE} color={color}/>
                                )
                            }
                        }

                    />
                    <Tab.Screen
                        name="CalendarStack"
                        component={CalendarStack}
                        options = {
                            {
                                tabBarIcon: ({color}) => (
                                    <Icon name="calendar-today" size={ICONSIZE} color={color}/>
                                )
                            }
                        }

                    />
                    <Tab.Screen
                        name="ProfileStack"
                        component={ProfileStack}
                        options = {
                            {
                                tabBarIcon: ({color}) => (
                                    <Icon name="account-circle" size={ICONSIZE} color={color}/>
                                )
                            }
                        }
                        listeners=
                        {
                            ({ navigation }) => 
                            (
                                {
                                    tabPress: (e) => {
                                    e.preventDefault();  // 기본 동작 막기
                                    navigation.navigate("ProfileStack",
                                            {
                                                screen: "Profile",
                                            }
                                        );
                                    },
                                }
                            )
                        }
                    />
                </Tab.Navigator>
            </View>       
        </SafeAreaView>


    )
}

const styles = StyleSheet.create({
    block:{
        flex: 1,
    },

    text:{
        fontSize: 24,
    },
})

export default MainTab;