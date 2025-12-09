// ProfileScreen — DEVICE SAFE VERSION (완전체)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useUserContext } from '../../contexts/UserContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NowInfo from '../../components/Profile/NowInfo';
import DailyInfo from '../../components/Profile/DailyInfo';
import MonthInfo from '../../components/Profile/MonthInfo';
import firestore from '@react-native-firebase/firestore';

function ProfileScreen({ navigation }) {
    const { user } = useUserContext();
    const [selectedTab, setSelectedTab] = useState('자리');

    /** ⭐ seatLabel 로컬 상태 */
    const [mySeatLabel, setMySeatLabel] = useState("-");

    /** seatId → seatLabel 로딩 */
    useEffect(() => {
        const loadSeatLabel = async () => {
            if (!user?.seatId) {
                setMySeatLabel("-");
                return;
            }

            const doc = await firestore()
                .collection("seats")
                .doc(user.seatId)
                .get();

            if (!doc.exists) {
                setMySeatLabel("-");
                return;
            }

            const data = doc.data();
            setMySeatLabel(data.seatLabel ?? "-");
        };

        loadSeatLabel();
    }, [user?.seatId]);

    const formatSeatForUI = (label) => {
        if (!label) return "-";

        return label
            .replace("제", "")
            .replace("번", "")
            .trim();
    };

    /** 상단바 간단 정보 */
    const BriefContent = () => {

        const formatStudyTime = (sec) => {
            if (!sec || sec <= 0) return "00:00";
            const h = String(Math.floor(sec / 3600)).padStart(2, "0");
            const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
            return `${h}:${m}`;
        };

        const formatGoal = (min) => {
            if (!min || min <= 0) return "00:00";
            const h = String(Math.floor(min / 60)).padStart(2, "0");
            const m = String(min % 60).padStart(2, "0");
            return `${h}:${m}`;
        };

        const studyHHMM = formatStudyTime(user?.todayTotalTime);
        const goalHHMM = formatGoal(user?.goals);

        return(
            <View style={styles.StateBar}>
                <View style={styles.StateItem}>
                    <Text style={styles.StateBarLabel}>공부 시간</Text>
                    <Text style={styles.StateBarValue}>{studyHHMM}</Text>
                </View>

                <View style={styles.StateItem}>
                    <Text style={styles.StateBarLabel}>목표 시간</Text>
                    <Text style={styles.StateBarValue}>{goalHHMM}</Text>
                </View>

                <View style={styles.StateItem}>
                    <Text style={styles.StateBarLabel}>내 좌석</Text>
                    <Text style={styles.StateBarValue}>{formatSeatForUI(mySeatLabel)}</Text>
                </View>
            </View>
        );
    };

    const renderContent = () => {
        switch(selectedTab) {
            case '자리': return <NowInfo />;
            case '일별': return <DailyInfo />;
            case '월별': return <MonthInfo />;
            default: return null;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>

            {/* --------------------------- */}
            {/*   🚀 header (고정) */}
            {/* --------------------------- */}
            <View style={styles.header}>
                <View style={styles.imageWrapper}>
                    <Image
                        source={require('../../assets/inha.png')}
                        style={{ width: 67, height: 67 }}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.header_first}>
                        <Text style={styles.nickname}>{user?.nickname}</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                            <Icon name="settings" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.studentNumber}>{user?.student_number}</Text>
                </View>
            </View>

            {/* --------------------------- */}
            {/*   🚀 탭 (고정) */}
            {/* --------------------------- */}
            <View style={styles.tabContainer}>
                {['자리', '일별', '월별'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabItem, selectedTab === tab && styles.activeTab]}
                        onPress={() => setSelectedTab(tab)}
                    >
                        <Text style={[styles.tabText, selectedTab === tab && styles.activeTabText]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* --------------------------- */}
            {/*   🚀 StateBar (고정) */}
            {/* --------------------------- */}
            {BriefContent()}

            {/* --------------------------- */}
            {/*   🚀 아래 내용만 스크롤 */}
            {/* --------------------------- */}
            <ScrollView 
                style={{ flex: 1 }} 
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {renderContent()}
            </ScrollView>

        </SafeAreaView>
    );
}

/* CSS는 1px도 변경 없음 */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#d3e3ff',
        height: '20%',
    },

    imageWrapper: {
        width: 67,
        height: 67,
        borderRadius: 33.5,
        overflow: 'hidden',
        marginRight: 16,
    },

    infoContainer: { flex: 1 },

    header_first:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    nickname: { fontSize: 30, fontWeight: 'bold' },
    studentNumber: { fontSize: 20, color: '#555' },

    StateBar: {
        backgroundColor: '#A2C6FC',
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    StateItem: { alignItems: 'center' },

    StateBarLabel: {
        color: '#828282',
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '600',
    },

    StateBarValue: {
        color: '#828282',
        fontSize: 18,
        fontWeight: 'bold',
    },

    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#d3e3ff',
        borderBottomWidth: 1,
        borderBottomColor: '#4D8CEB'
    },
    
    tabItem: {
        paddingVertical: 10,
        flex: 1,
        alignItems: 'center',
        opacity: 0.4,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent'
    },

    activeTab: {
        opacity: 1,
        borderBottomColor: '#4D8CEB'
    },

    tabText: { fontSize: 16, color: '#4D8CEB' },
    activeTabText: { fontWeight: 'bold' },

    content: { flex: 1 }
});

export default ProfileScreen;
