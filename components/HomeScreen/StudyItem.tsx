// StudyItem.tsx — 버튼 숨김 버전 (CSS 그대로)

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

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
    subjectTimes,
    onPress,
    onLongPress,
    onDelete,

    // disabled flags
    disabledPress,
    disabledEdit,
    disabledDelete,
    }) 
{
    if (!subject) return null;

    const uiTime = subjectTimes[subject.id] ?? subject.time ?? 0;

    return (
        <TouchableOpacity
            style={[styles.container, selected && styles.selected]}
            onPress={onPress}
            onLongPress={onLongPress}
            disabled={disabledPress}
        >
            <View style={styles.left}>
                <View style={[styles.dot, selected && styles.dotSel]} />
                    <Text style={selected ? styles.nameSel : styles.name}>
                        {subject.name}
                    </Text>
            </View>

            <View style={styles.right}>
                <Text style={styles.time}>{format(uiTime)}</Text>

                {/* base 과목은 삭제/편집 없음 */}
                {subject.id !== "base" && (
                <>
                    {/*  삭제 버튼 숨기기 */}
                    {!disabledDelete && 
                        (
                            <TouchableOpacity onPress={onDelete}>
                                <Icon name="delete" size={20} color="#000" />
                            </TouchableOpacity>
                        )
                    }

                    {/*  편집 버튼 숨기기 */}
                    {!disabledEdit && 
                        (
                            <TouchableOpacity onPress={onLongPress}>
                                <Icon name="edit" size={20} color="#000" />
                            </TouchableOpacity>
                        )
                    }
                </>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: { 
        padding: 14, 
        flexDirection: "row", 
        justifyContent: "space-between" 
    },
    selected: { 
        backgroundColor: "#eef4ff" 
    },

    left: { 
        flexDirection: "row", 
        alignItems: "center" 
    },
    dot: { 
        width: 12, 
        height: 12, 
        borderRadius: 6, 
        backgroundColor: "#ccc", 
        marginRight: 10 
    },
    dotSel: { 
        backgroundColor: "#5A8DEE" 
    },

    name: { 
        fontSize: 16 
    },
    nameSel: { 
        fontSize: 16, 
        fontWeight: "bold" 
    },

    right: { 
        flexDirection: "row",
        alignItems: "center", 
        gap: 12 
    },
    time: { 
        fontSize: 15,
         minWidth: 80, 
         textAlign: "right" 
    },
});
