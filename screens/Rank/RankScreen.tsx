// RankScreen — SAFEAREA 안정화 완전체

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TotalRanking from "../../components/RankScreen/TotalRanking";
import DeptRanking from "../../components/RankScreen/DeptRanking";

function RankScreen() {
    const [selectedTab, setSelectedTab] = useState("전체 랭킹");

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
            <View style={styles.container}>

                <View style={styles.tabContainer}>
                {["전체 랭킹", "학과 랭킹"].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tabItem,
                            selectedTab === tab && styles.activeTab,
                        ]}
                        onPress={() => setSelectedTab(tab)}
                    >
                        <Text
                            style={[
                            styles.tabText,
                            selectedTab === tab && styles.activeTabText,
                            ]}
                        >
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
                </View>

                <View style={{ flex: 1 }}>

                    <View
                        style={
                        selectedTab === "전체 랭킹"
                            ? styles.shown
                            : styles.hidden
                        }
                    >
                        <TotalRanking />
                    </View>

                    <View
                        style={
                        selectedTab === "학과 랭킹"
                            ? styles.shown
                            : styles.hidden
                        }
                    >
                        <DeptRanking />
                    </View>

                </View>
            </View>
        </SafeAreaView>
    );
}

export default React.memo(RankScreen);

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#fff" },

    tabContainer: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#ddd",
        paddingLeft: 16,
        paddingTop: 40,
    },

    tabItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },

    tabText: { 
        fontSize: 16, 
        color: "#999" 
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#4D8CEB",
    },
    activeTabText: { 
        color: "#4D8CEB", 
        fontWeight: "bold" 
    },

    shown: {
        flex: 1,
    },
    hidden: {
        height: 0,
        overflow: "hidden",
    },
});
