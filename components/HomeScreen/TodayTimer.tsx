// components/HomeScreen/TodayTimer.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TodayTimer({ uiTime }) {
    const format = (sec) => {
        const h = String(Math.floor(sec / 3600)).padStart(2, "0");
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
        return `${h}:${m}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.circle}>
                <Text style={styles.text}>{format(uiTime)}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E6F0FF",
        height: "60%",
    },
    circle: {
        width: 275,
        height: 275,
        borderRadius: 200,
        borderWidth: 10,
        borderColor: "#5A8DEE",
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontSize: 60,
        color: "#828282",
        fontWeight: "400",
    },
});
