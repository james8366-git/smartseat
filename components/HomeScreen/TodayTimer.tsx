import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';

//수정
function TodayTimer({ isStudying }) {

    const [seconds, setSeconds] = useState(0);
    const intervalRef = useRef(null);

    // 타이머 start / stop 처리
    useEffect(() => {
        if (isStudying) {
            // 타이머 시작
            if (!intervalRef.current) {
                intervalRef.current = setInterval(() => {
                    setSeconds(prev => prev + 1);
                }, 1000);
            }
        } else {
            // 타이머 중지
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isStudying]);

    // HH:MM 형식 변환
    const convertTime = () => {
        if(seconds ===  0) return "00:00";
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const displayHours = String(hours).padStart(2, '0');
        const displayMinutes = String(minutes % 60).padStart(2, '0');

        return `${displayHours}:${displayMinutes}`;
    };//여기 까지

    return (
        <View style={styles.container}>
            <View style={styles.circle}>
                <Text style={styles.text}>{convertTime()}</Text>
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
