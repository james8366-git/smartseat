// components/Reservation/Room/SeatGrid.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import SeatBox from "./SeatBox";

interface SeatItem {
  id: string;          // Firestore 문서 ID
  seat_number: number; // 좌석 번호
  status: string;      // "none" | "reserved" | "occupied"
  student_number: string;
  room: string;
}

interface Props {
  seats: SeatItem[];
  seatsPerRow: number;
  onSeatPress: (seat: SeatItem) => void;
}

function SeatGrid({ seats, seatsPerRow, onSeatPress }: Props) {
  /**
   * 좌석 배열을 N칸씩 나누기
   */
  const seatRows: SeatItem[][] = [];
  for (let i = 0; i < seats.length; i += seatsPerRow) {
    seatRows.push(seats.slice(i, i + seatsPerRow));
  }

  return (
    <View style={styles.seatContainer}>
      {seatRows.map((row, rowIdx) => (
        <View key={`row-${rowIdx}`} style={styles.seatRow}>
          {row.map((seat) => (
            <SeatBox
              key={seat.id} // 🔥 Firestore 문서 ID를 key로 사용 (절대 중복 없음)
              seatNumber={seat.seat_number}
              disabled={seat.status !== "none"} // 예약된 좌석 클릭 불가
              onPress={() => {
                if (seat.status === "none") {
                  onSeatPress(seat);
                }
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  seatContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
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
