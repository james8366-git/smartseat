import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

function StudyItem({ item, onSelect, onEdit, onDelete }) {
    return (
        <View style={styles.list}>
            <TouchableOpacity
                style={
                    [
                        styles.circle, { backgroundColor: item.selected ? '#5A8DEE' : '#E3EBFF' }
                    ]
                }
                onPress={() => onSelect(item.id)}
            />
            <TouchableOpacity style={styles.item} onPress={() => onEdit(item)}>
                <Text style={styles.text}>{item.name}</Text>
            </TouchableOpacity>
            
            <View style={styles.item}>
                <Text style={styles.time}>{item.time}</Text>
            </View>

            {item.id !== '0' ? 
                (
                    <TouchableOpacity onPress={() => onDelete(item.id)}>
                        <Icon name="delete" size={24} color="#000" />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 24 }} />
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    list: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: 'white',
    },
    item: { 
        flex: 1,
        alignItems: 'center', 
        justifyContent: 'center' ,
        },
    circle: { 
        width: 25, 
        height: 25, 
        borderRadius: 12, 
        marginRight: 12, },
    text: { 
        color: '#555' 
    },
    time: { 
        color: '#555' 
    },
});

export default StudyItem;
