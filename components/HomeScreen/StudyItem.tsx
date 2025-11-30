// components/HomeScreen/StudyItem.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

/* 안전한 HH:MM:SS 포맷 */
function format(sec) {
  const safe = typeof sec === "number" && !isNaN(sec) ? sec : 0;
  const h = String(Math.floor(safe / 3600)).padStart(2, "0");
  const m = String(Math.floor((safe % 3600) / 60)).padStart(2, "0");
  const s = String(safe % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function StudyItem({
  item,
  selectedId,
  subjectUiTime,
  onSelect,
  onEdit,
  onDelete,
}) {
  const isSelected = item.id === selectedId;
  const isBase = item.id === "base";

  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[styles.container, isSelected && styles.selectedRow]}
    >
      <View style={styles.left}>
        <View style={[styles.dot, isSelected && styles.selectedDot]} />
        <Text style={isSelected ? styles.nameSelected : styles.name}>
          {item.name}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.time}>{format(subjectUiTime)}</Text>

        {!isBase && (
          <>
            <TouchableOpacity onPress={onDelete}>
              <Icon name="delete" size={20} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onEdit}>
              <Icon name="edit" size={20} color="#000" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

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
