import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUserContext } from '../../contexts/UserContext';
import { getTodayTotalTime } from '../../lib/studylogs';

function TodayTimer() {
    const { user } = useUserContext();
    const [time, setTime] = useState("00:00");

    const formatTime = (minutes: number) => {
        const h = String(Math.floor(minutes / 60)).padStart(2, "0");
        const m = String(minutes % 60).padStart(2, "0");
        return `${h}:${m}`;
    };

    useEffect(() => {
        if (!user?.uid) return;

        const load = async () => {
            const totalMinutes = await getTodayTotalTime(user.uid);
            setTime(formatTime(totalMinutes));
        };

        load();
    }, [user]);

    return (
        <View style={styles.container}>
            <View style={styles.circle}>
                <Text style={styles.text}>{time}</Text>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#E6F0FF', 
        height: '60%',
    },
    
    circle: {
        width: 275, 
        height: 275, 
        borderRadius: 200, 
        borderWidth: 10, 
        borderColor: '#5A8DEE',
        backgroundColor: 'white', 
        alignItems: 'center', 
        justifyContent: 'center',
    },

    text: { 
        fontSize: 60, 
        color: '#828282', 
        fontWeight: '400',
    },
});

export default TodayTimer;
