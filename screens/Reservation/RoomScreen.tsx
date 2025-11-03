import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

function RoomScreen({ route }) {
    const { roomName } = route.params;
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // 예시 좌석 2x3
    const seats = [
        ['1', '2',],
        ['3', '4',],
    ];

    const handleSeatPress = (seatNumber) => {
        setSelectedSeat(seatNumber);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{roomName}</Text>

            <View style={styles.seatContainer}>
                {seats.map(
                    (row, rowIndex) => 
                        (
                            <View key={rowIndex} style={styles.seatRow}>
                                {row.map(
                                    (seat) => 
                                        (
                                            <TouchableOpacity
                                                key={seat}
                                                style={styles.seat}
                                                onPress={() => handleSeatPress(seat)}
                                            >
                                                <Text style={styles.seatText}>{seat}</Text>
                                            </TouchableOpacity>
                                        )
                                    )
                                }
                            </View>
                        )
                    )   
                }
            </View>

            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={
                    () => setModalVisible(false)
                }
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalText}>
                            좌석 {selectedSeat}번 선택
                        </Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.modalButton}
                        >
                            <Text style={styles.modalButtonText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
    },

    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#5A8DEE',
        marginBottom: 10,
    },

    seatContainer: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#000',
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    seatRow: {
        flexDirection: 'row',
        marginVertical: 5,
    },

    seat: {
        width: 30,
        height: 30,
        backgroundColor: '#E3EBFF',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
    },

    seatText: {
        fontSize: 12,
        color: '#333',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalBox: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: 200,
        alignItems: 'center',
    },

    modalText: {
        marginBottom: 12,
        fontSize: 16,
    },

    modalButton: {
        backgroundColor: '#5A8DEE',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 6,
    },

    modalButtonText: {
        color: 'white',
        fontWeight: '600',
    },

});

export default RoomScreen;