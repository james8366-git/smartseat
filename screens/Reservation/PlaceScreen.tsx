import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const ROOMS = [
  { id: '1', name: '제1열람실', type: 'reading_room', seats: 6 },
  { id: '2', name: '제2-1열람실', type: 'reading_room', seats: 0 },
  { id: '3', name: '제2-2열람실', type: 'reading_room', seats: 0 },
  { id: '4', name: '제2-2열람실 (대학원생 전용)', type: 'reading_room', seats: 0 },
];

function PlaceScreen({ navigation }) {

    const [selectedTab, setSelectedTab] = useState('reading_room');
 
    const filteredRooms = ROOMS.filter((room) => room.type === selectedTab);

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabItem, selectedTab === 'reading_room' && styles.activeTab]}
                    onPress={() => setSelectedTab('reading_room')}
                >
                    <Text
                        style={
                            [
                                styles.tabText,
                                selectedTab === 'reading_room' && styles.activeTabText,
                            ]
                        }
                    >
                        일반열람실
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.separator}/>
            <FlatList
                data={filteredRooms}
                numColumns={2}
                keyExtractor={
                    (item) => item.id
                }
                columnWrapperStyle = {
                    { justifyContent: 'space-around' }
                }
                renderItem = { ({item}) => 
                    (
                        <TouchableOpacity
                            style={styles.roomButton}
                            onPress={() => navigation.navigate('Room', { roomName: item.name })}
                        >
                            <View style={styles.circle}>
                                <Text style={styles.circleText}>
                                    {item.seats}
                                </Text>
                            </View>
                            <Text style={styles.roomName}>{item.name}</Text>
                        </TouchableOpacity>
                    )
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

    tabBar: {
        height: '20%',
        flexDirection: 'row',
        alignItems:'flex-end',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        marginBottom: 8,
    },

    tabItem: {
        marginRight: 16,
        paddingBottom: 6,
    },

    tabText: {
        fontSize: 16,
        color: '#666',
    },

    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#5A8DEE',
    },

    activeTabText: {
        color: '#5A8DEE',
        fontWeight: 'bold',
    },

    separator : {
        height: 1,
        backgroundColor: '#DADADA',
    },

    roomButton: {
        alignItems: 'center',
        marginVertical: 20,
    },

    circle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 6,
        borderColor: '#5A8DEE',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },

    circleText: {
        fontSize: 16,
        color: '#555',
    },

    roomName: {
        marginTop: 8,
        fontSize: 14,
        color: '#555',
    },

});

export default PlaceScreen;