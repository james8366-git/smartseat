import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

function NowInfo(){
    return(
        <View style={styles.contentList}>

            <View style={styles.contentBox}>
                <Text style={styles.contentTitle}>예약좌석</Text>
                <View style={styles.rightGroup}>
                    <Text style={styles.contentText}>1-256</Text>
                    <TouchableOpacity style={styles.returnButton} onPress={() => console.log('반납 클릭')}>
                        <Text style={styles.returnButtonText}>반납</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.contentBox}>
                <Text style={styles.contentTitle}>예약시간</Text>
                <Text style={styles.contentText}>00:00 ~ 00:00</Text>
            </View>

            <View style={styles.contentBox}>
                <Text style={styles.contentTitle}>공부시작시간</Text>
                <Text style={styles.contentText}>00:00</Text>
            </View>

            <View style={styles.contentBox}>
                <Text style={styles.contentTitle}>공부시간</Text>
                <Text style={styles.contentText}>00:00</Text>
            </View>

            <View style={styles.contentBox}>
                <Text style={styles.contentTitle}>쉬는시간</Text>
                <Text style={styles.contentText}>00:00</Text>
            </View>
        </View>
    )

};

const styles = StyleSheet.create({
    contentList: {
        flex: 1,
    },

    contentBox:{
        flexDirection: 'row',       
        justifyContent: 'space-between', 
        alignItems: 'center',        
        backgroundColor: 'white',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
        width: '100%',
    },

    contentTitle: {
        fontSize: 15,
        color: '#828282',
        marginLeft: 24,
    },

    contentText: {
        fontSize: 15,
        color: '#828282',
        marginRight: 24,
    },

    rightGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10, 
    },

    returnButton: {
        backgroundColor: '#005bac',
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 6,
    },

    returnButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
})
export default NowInfo;