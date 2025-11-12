import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function TodayTimer({ time = '00:00' }) {
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
