// components/Home/AddSubject.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

function AddSubject({ subjects, setSubjects }) {
  const handleAddSubject = () => {
    setSubjects([
      ...subjects,
      {
        id: Date.now().toString(),
        name: '새 과목',
        time: '00:00:00',
        selected: false,
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.addButton} onPress={handleAddSubject}>
      <Text style={styles.addText}>+ 과목 추가하기</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addButton: {
    padding: 16,
    alignItems: 'flex-start',
    backgroundColor: 'white',
  },
  addText: {
    color: '#5A8DEE',
    fontWeight: '500',
  },
});

export default AddSubject;
