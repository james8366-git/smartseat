import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getSeatsByRoom } from '../../lib/seats';

import SeatGrid from '../../components/Reservation/Room/SeatGrid';
import SeatModal from '../../components/Reservation/Room/SeatModal';

function RoomScreen({ route }) {
  const { roomName, roomId } = route.params;

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadSeats = async () => {
      const list = await getSeatsByRoom(roomId);
      setSeats(list);
    };
    loadSeats();
  }, [roomId]);

  const handleSeatPress = (seatNumber) => {
    setSelectedSeat(seatNumber);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{roomName}</Text>

      <SeatGrid
        seats={seats}
        seatsPerRow={2} // 기존 2x2 형태 그대로 유지
        onSeatPress={handleSeatPress}
      />

      <SeatModal
        visible={modalVisible}
        seatNumber={selectedSeat}
        onClose={() => setModalVisible(false)}
      />
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
});

export default RoomScreen;
