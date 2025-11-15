import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

function SeatModal({ visible, seatNumber, onClose }) {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.modalText}>좌석 {seatNumber}번 선택</Text>
                    
                    <TouchableOpacity style={styles.modalButton} onPress={onClose}>
                        <Text style={styles.modalButtonText}>닫기</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
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

export default SeatModal;
