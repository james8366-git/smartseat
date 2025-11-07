import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function SettingsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>설정 화면</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: { 
        fontSize: 18 
    },
});

export default SettingsScreen;