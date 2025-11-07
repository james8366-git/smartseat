import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, DatePic } from 'react-native';
import { useUserContext } from '../../contexts/UserContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Inha from '../../assets/inha.svg';

function ProfileScreen({ navigation }) {
    const { user } = useUserContext();
    const [selectedTab, setSelectedTab] = useState('자리');

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [targetTime, setTargetTime] = useState('00:00');
    const [showTimePicker, setShowTimePicker] = useState(false);

    const formatDate = (date) => {
        return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    };

    const handlePrevDay = () => {
        setSelectedDate(prev => new Date(prev.setDate(prev.getDate() - 1)));
    };

    const handleNextDay = () => {
        setSelectedDate(prev => new Date(prev.setDate(prev.getDate() + 1)));
    };

    const openDatePicker = () => {
        setShowDatePicker(true);
    };

    const openTimePicker = () => {
        setShowTimePicker(true);
    };

    const onDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    const onTimeChange = (event, time) => {
        setShowTimePicker(false);
        if (time) {
        const formatted = `${time.getHours().toString().padStart(2, '0')}:
        ${
            time.getMinutes()
                .toString()
                .padStart(2, '0')}`;
                setTargetTime(formatted);
        }
    };


    const BriefContent = () => {
        return(
            <View style={styles.StateBar}>
                <View style={styles.StateItem}>
                    <Text style={styles.StateBarLabel}>공부 시간</Text>
                    <Text style={styles.StateBarValue}>00:00</Text>
                </View>
                <View style={styles.StateItem}>
                    <Text style={styles.StateBarLabel}>목표 시간</Text>
                    <Text style={styles.StateBarValue}>00:00</Text>
                </View>
                <View style={styles.StateItem}>
                    <Text style={styles.StateBarLabel}>내 좌석</Text>
                    <Text style={styles.StateBarValue}>1-256</Text>
                </View>
            </View>
        );
    };

    const renderContent = () => {
        switch(selectedTab) {
            case '자리':
                return (
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
                );
            case '일별':
            return (
                <View style={styles.contentList}>
                    <View style={styles.dateBar}>
                        <TouchableOpacity onPress={handlePrevDay}>
                            <Icon name="chevron-left" size={28} color="#333" />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={openDatePicker}>
                            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleNextDay}>
                            <Icon name="chevron-right" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.contentBox}>
                        <Text style={styles.contentTitle}>공부시작시간</Text>
                        <Text style={styles.contentText}>00:00</Text>
                    </View>

                    <View style={styles.contentBox}>
                        <Text style={styles.contentTitle}>목표 시간</Text>
                            <View style={styles.rightGroup}>
                                <Text style={styles.contentText}>{targetTime}</Text>
                                <TouchableOpacity onPress={openTimePicker}>
                                    <Icon name="arrow-drop-down" size={28} color="#333" />
                                </TouchableOpacity>
                            </View>
                    </View>

                    <View style={styles.contentBox}>
                        <Text style={styles.contentTitle}>오늘공부시간</Text>
                        <Text style={styles.contentText}>00:00</Text>
                    </View>

                    <View style={styles.contentBox}>
                        <Text style={styles.contentTitle}>쉬는시간</Text>
                        <Text style={styles.contentText}>00:00</Text>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={[styles.progressFill, {width: '50%'}]} />
                        <View style={styles.progressRemain} />
                    </View>

                    <View style={styles.progressLabel}>
                        <Text style={styles.graphLabel}>공부시간</Text>
                        <Text style={styles.graphLabel}>목표시간</Text>
                    </View>

                    {showDatePicker && 
                        (
                            <DateTimePicker
                            value={selectedDate}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                            />
                        )
                    }

                    {showTimePicker && 
                        (
                            <DateTimePicker
                            value={new Date()}
                            mode="time"
                            is24Hour={true}
                            display="default"
                            onChange={onTimeChange}
                            />
                        )
                    }
                </View>
            );
 
                case '월별':
                return (
                    <View style={styles.contentList}>
                        <Text style={styles.contentText}>월별 공부 통계</Text>
                    </View>
                );

                default:
                return null;
        }
    }


    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.imageWrapper}>
                    <Inha width={67} height={67}/>
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

                {/* <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                    <Icon name="settings" size={24} color="black" />
                </TouchableOpacity> */}
            </View>

            <View style={styles.tabContainer}>
                { ['자리', '일별', '월별'].map
                    (tab => 
                        (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tabItem, selectedTab === tab && styles.activeTab]}
                                onPress={() => setSelectedTab(tab)}
                            >

                                <Text
                                    style={
                                        [
                                            styles.tabText,
                                            selectedTab === tab && styles.activeTabText,
                                        ]
                                    }
                                >
                                {tab}
                                </Text>
                            </TouchableOpacity>
                        )
                    )

                }
            </View>
            <View>
                {BriefContent()}
            </View>

                <View style={styles.content}>
                    {renderContent()}
                </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: 'white',
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#d3e3ff',
        borderBottomColor: '#ddd',
        borderBottomWidth: 1,
        height: '20%',
    },

    imageWrapper: {
        width: 67,
        height: 67,
        borderRadius: 33.5,
        overflow: 'hidden',
        marginRight: 16,
    },

    infoContainer: {
        flex: 1,
    },

    header_first:{
        flexDirection: 'row',
        alignItems: 'center',
    },

    nickname: { 
        fontSize: 30, 
        fontWeight: 'bold' 
    },

    studentNumber: { 
        fontSize: 20,
        color: '#555' 
    },

    StateBar: {
        backgroundColor: '#A2C6FC',
        paddingVertical: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    StateItem: {
        alignItems: 'center',
    },

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
        borderBottomColor: '#d3e3ff',
        backgroundColor: '#d3e3ff',
        borderBottomWidth: 1,
    },

    tabItem: {
        paddingVertical: 10,
        flex: 1,
        alignItems: 'center',
        color: '#4d8ceb',
        borderBottomColor: '#4D8CEB',
        borderBottomWidth: 3,
        opacity: 0.4,
    },

    tabText: {
        fontSize: 16,
        color: '#4D8CEB',
    },


    activeTab: {
        borderBottomColor: '#4D8CEB',
        borderBottomWidth: 3,
        opacity: 1,
    },

    activeTabText: {
        color: '#4D8CEB',
        fontWeight: 'bold',
        opacity: 1,
    },

    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

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

    progressContainer: {
        flexDirection: 'row',
        width: '90%',
        alignSelf: 'center',
        height: 20,
        backgroundColor: '#ccc',
        borderRadius: 6,
        marginTop: 20,
        overflow: 'hidden',
    },

    progressFill: {
        backgroundColor: '#005bac',
    },

    progressRemain: {
        flex: 1,
        backgroundColor: '#ddd',
    },

    progressLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        alignSelf: 'center',
        marginTop: 8,
    },

    graphLabel: {
        color: '#555',
        fontSize: 14,
    },
    dateBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#eaf0fb',
        paddingVertical: 8,
        paddingHorizontal: 20,
    },

    dateText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
});

export default ProfileScreen;
