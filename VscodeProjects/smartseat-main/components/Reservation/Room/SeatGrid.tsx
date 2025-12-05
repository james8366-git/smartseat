// components/Reservation/Room/SeatGrid.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import SeatBox from "./SeatBox";

interface SeatItem {
  id: string;
  seat_number: number;
  status: string;
  student_number: string;
  room: string;

  adminColor?: string; // 관리자용 색상
}

interface Props {
  seats: SeatItem[];
  seatsPerRow: number;
  onSeatPress: (seat: SeatItem) => void;

  // seat의 색상을 외부에서 결정하는 함수 (관리자 화면에서 활용)
  seatColorFn?: (seat: SeatItem) => string;

  // 🔥 관리자 여부 - true면 모든 좌석 클릭 가능
  adminMode?: boolean;
}

function SeatGrid({
  seats,
  seatsPerRow,
  onSeatPress,
  seatColorFn,
  adminMode = false, // 기본값 false → 사용자 화면
}: Props) {
  const seatRows: SeatItem[][] = [];
  for (let i = 0; i < seats.length; i += seatsPerRow) {
    seatRows.push(seats.slice(i, i + seatsPerRow));
  }

  return (
    <View style={styles.seatContainer}>
      {seatRows.map((row, rowIdx) => (
        <View key={`row-${rowIdx}`} style={styles.seatRow}>
          {row.map((seat) => {
            const dynamicColor = seatColorFn ? seatColorFn(seat) : undefined;

            return (
              <SeatBox
                key={seat.id}
                seatNumber={seat.seat_number}
                adminColor={dynamicColor}
                
                // 🔥 관리자면 좌석 클릭 제한 없음 / 일반 사용자면 status === "none"만 허용
                disabled={!adminMode && seat.status !== "none"}

                onPress={() => {
                  if (adminMode) {
                    onSeatPress(seat); // 관리자 → 모든 좌석 클릭
                  } else if (seat.status === "none") {
                    onSeatPress(seat); // 사용자 → 비어있는 좌석만 클릭 가능
                  }
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  seatContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  seatRow: {
    flexDirection: "row",
    marginVertical: 5,
  },
});

export default SeatGrid;
