// components/HomeScreen/StudyItem.tsx — FINAL STABLE VERSION

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

/* HH:MM:SS 포맷 */
function format(sec) {
  const s = typeof sec === "number" ? sec : 0;
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${ss}`;
}

export default function StudyItem({
  subject,
  selected,
  subjectTimes = {},
  onPress,
  onLongPress,
  onDelete,
}) {
  if (!subject) return null;

  const { id, name } = subject;
  const uiTime = subjectTimes[id] ?? subject.time ?? 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.container, selected && styles.selectedRow]}
    >
      <View style={styles.left}>
        <View style={[styles.dot, selected && styles.selectedDot]} />
        <Text style={selected ? styles.nameSelected : styles.name}>
          {name}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.time}>{format(uiTime)}</Text>

        {id !== "base" && (
          <>
            <TouchableOpacity onPress={onDelete}>
              <Icon name="delete" size={20} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onLongPress}>
              <Icon name="edit" size={20} color="#000" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* CSS는 형의 원본 그대로 */
const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedRow: {
    backgroundColor: "#eef4ff",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#d9d9d9",
    marginRight: 12,
  },
  selectedDot: {
    backgroundColor: "#5A8DEE",
  },
  name: {
    fontSize: 16,
  },
  nameSelected: {
    fontSize: 16,
    fontWeight: "700",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  time: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 80,
    textAlign: "right",
  },
});
