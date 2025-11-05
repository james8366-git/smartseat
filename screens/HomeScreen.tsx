import React, { useState } from 'react';
import {useUserContext} from '../contexts/UserContext' ;
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

function HomeScreen() {

    const [subjects, setSubjects] = useState([
        { id: '0', name: '공부', time: '00:00:00', selected: true },
        { id: '1', name: '알고리즘', time: '00:00:00', selected: false },
        { id: '2', name: '자료구조', time: '00:00:00', selected: false },
    ]);

    const toggleSelect = (id) => {
      setSubjects(prev =>
        prev.map(sub => (
            {
              ...sub,
              selected: sub.id === id,
            }
          )
        )
      );
    };

    const addSubject = () => {
        setSubjects(prev => [
        ...prev,
            { id: Date.now().toString(), name: '새 과목', time: '00:00:00', selected: false },
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.subjectList}>
            <TouchableOpacity
                style={
                    [
                        styles.circle,
                        { backgroundColor: item.selected ? '#5A8DEE' : '#E3EBFF' },
                    ]
                }
                onPress={() => toggleSelect(item.id)}
            />
            <View style={styles.subjectItem}>
                <Text style={styles.subjectText}>{item.name}</Text>
            </View>
            <View style={styles.subjectItem}>
                <Text style={styles.timeText}>{item.time}</Text>
            </View>

        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.timerContainer}>
                <View style={styles.timerCircle}>
                    <Text style={styles.timerText}>00:00</Text>
                </View>
            </View>

            <View style={styles.Header}>
                <View style={styles.circle}/>
                <View style={styles.HeaderBox}>
                    <Text style={styles.HeaderText}>공부과목</Text>
                </View>
                <View style={styles.HeaderBox}>
                    <Text style={styles.HeaderText}>공부시간</Text>
                </View>
            </View>

        <FlatList
            data={subjects}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            ListFooterComponent = {
            <TouchableOpacity style={styles.addButton} onPress={addSubject}>
                <Text style={styles.addText}>+ 과목 추가하기</Text>
            </TouchableOpacity>
            }
        />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },

    timerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E6F0FF',
      height: '60%',

    },

    timerCircle: {
      width: 275,
      height: 275,
      borderRadius: 200,
      borderWidth: 10,
      borderColor: '#5A8DEE',
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
    },

    timerText: {
      fontSize: 60,
      color: '#828282',
      fontWeight: '400',
    },

    Header: {
      height: 42,
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#E0E0E0',
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: '#FAFAFA',
    },
    HeaderBox: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    HeaderText: {
        fontSize: 15,
        color: '#555',
    },

    subjectList: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderColor: '#E0E0E0',
      backgroundColor: 'white',
    },

    subjectItem : {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    circle: {
      width: 25,
      height: 25,
      borderRadius: 12,
      marginRight: 12,
    },

    subjectText: {
      flex: 1,
      color: '#555',
    },

    timeText: {
      color: '#555',
    },

    addButton: {
      padding: 16,
      alignItems: 'flex-start',
      backgroundColor: 'white',
    },

    addText: {
      color: '#5A8DEE',
      fontWeight: '500',
    },
});


export default HomeScreen;
