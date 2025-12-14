import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { returnSeatTransaction } from "../../lib/seats";

export default function ReturnSeat({ user, seatData }) {
    const handleReturn = () => {
        Alert.alert(
            "좌석 반납",
            "정말 좌석을 반납하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "반납",
                    style: "destructive",
                    onPress: async () => {
                        try {
                        if (!user?.uid || !user?.seatId) return;

                        await returnSeatTransaction({
                            uid: user.uid,
                            seatId: user.seatId,
                            selectedSubject: user.selectedSubject,
                        });

                        Alert.alert(
                            "반납 완료",
                            "해당 시점까지의 공부시간이 저장되었습니다."
                        );
                        } catch (e) {
                        Alert.alert("에러", "반납 처리 중 문제가 발생했습니다.");

                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
        <Text style={styles.label}>예약좌석:</Text>
        <Text style={styles.room}>
            {user?.seatId ? seatData?.seatLabel ?? user.seatId : "-"}
        </Text>

        {user?.seatId && (
            <TouchableOpacity style={styles.btn} onPress={handleReturn}>
            <Text style={styles.btnText}>반납</Text>
            </TouchableOpacity>
        )}
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#f4f4f4",
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  label: { fontSize: 16, fontWeight: "600" },
  room: { marginLeft: 12, fontSize: 16, flex: 1 },
  btn: {
    backgroundColor: "#5A8DEE",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
