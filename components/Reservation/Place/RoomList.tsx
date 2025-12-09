import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { getSeatCountByRoom } from '../../../lib/seats';
import Svg, { Circle } from 'react-native-svg';

const ROOMS = [
  { id: '11', name: '제1열람실', type: 'reading_room' },
  { id: '21', name: '제2-1열람실', type: 'reading_room' },
  { id: '22', name: '제2-2열람실', type: 'reading_room' },
  { id: '23', name: '제2-2열람실 (대학원생 전용)', type: 'reading_room' },
];

function RoomList({ selectedTab, navigation }) {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchCounts = async () => {
      const result = [];

      for (const room of ROOMS) {
        const count = await getSeatCountByRoom(room.id);

        // count = { total, available, reserved }
        result.push({
          ...room,
          total: count.total,
          available: count.available,
          reserved: count.reserved,
        });
      }

      setRooms(result);
    };
    fetchCounts();
  }, []);

  const filteredRooms = rooms.filter(room => room.type === selectedTab);

  return (
    <FlatList
      data={filteredRooms}
      numColumns={2}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={{ 
        justifyContent: 'space-between',

       }}
      renderItem={({ item }) => {
        const total = item.total ?? 0;
        const available = item.available ?? 0;
        const ratio = total > 0 ? available / total : 0;

        const size = 120;
        const stroke = 6;
        const radius = (size - stroke) / 2; // 57
        const circumference = 2 * Math.PI * radius;

        return (
          <TouchableOpacity
            style={ [styles.roomButton, {width: '50%'}]}
            onPress={() =>
              navigation.navigate('Room', {
                roomName: item.name,
                roomId: item.id,
              })
            }
          >
            {/* 원형 Progress Border */}
            <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
              <Svg width={size} height={size}>
                {/* 회색 전체 border */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#D0D0D0"
                  strokeWidth={stroke}
                  fill="none"
                />

                {/* available 비율만큼 파란색 border */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#5A8DEE"
                  strokeWidth={stroke}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - ratio)}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${size / 2}, ${size / 2}`}
                />
              </Svg>

              {/* 중앙 텍스트 */}
              <View style={styles.centerTextWrapper}>
                <Text style={styles.circleText}>
                  {available} / {total}
                </Text>
              </View>
            </View>

            <Text style={styles.roomName}>{item.name}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  roomButton: {
    alignItems: 'center',
    marginVertical: 20,
  },

  centerTextWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  circleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },

  roomName: {
    marginTop: 8,
    fontSize: 14,
    color: '#555',
  },
});

export default RoomList;
