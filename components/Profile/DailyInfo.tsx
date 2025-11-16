import React, {useState} from "react";
import { View, StyleSheet, TouchableOpacity, Text, Modal, FlatList } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

function DailyInfo() {
    
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [targetTime, setTargetTime] = useState('00:00');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showTimeModal, setShowTimeModal] = useState(false);

    const timeOptions = [];
    for (let h = 0; h < 24; h++) {
        for (let m = 0; m < 60; m += 30) {
            const formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            timeOptions.push(formatted);
        }
    }

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

    const openTimeModal = () => { 
        setShowTimeModal(true); 
    }
    const closeTimeModal = () => { 
        setShowTimeModal(false); 
    }

    const onDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    const selectTime = (time) => {                        
        setTargetTime(time);
        closeTimeModal();
    };


    return(
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
                        <TouchableOpacity onPress={openTimeModal}>
                            <Icon name="arrow-drop-down" size={28} color="#333" />
                        </TouchableOpacity>
                    </View>
            </View>

            <Modal visible={showTimeModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>목표 시간 선택</Text>
                        <FlatList
                            data={timeOptions}
                            keyExtractor={(item) => item}
                            renderItem={({item}) => (
                                <TouchableOpacity style={styles.timeItem} onPress={() => selectTime(item)}>
                                    <Text style={styles.timeText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity onPress={closeTimeModal} style={styles.closeButton}>
                            <Text style={styles.closeText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
        justifyContent: 'center',
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

     modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBox: {
        width: '80%',
        height: '70%',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
    },

    modalTitle: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        marginBottom: 10, 
        textAlign: 'center' 
    },

    timeItem: {
        paddingVertical: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },

    timeText: { 
        fontSize: 18, 
        color: '#333' 
    },

    closeButton: {
        backgroundColor: '#005bac',
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 10,
    },

    closeText: { 
        color: 'white', 
        fontWeight: '600', 
        textAlign: 'center', 
        fontSize: 16 
    },
})

export default DailyInfo;