// components/Home/EditSubject.tsx
import React from 'react';
import { Alert } from 'react-native';
import EditSubjectModal from './EditSubjectModal';

function EditSubject({
  visible,
  setVisible,
  editingSubject,
  setEditingSubject,
  newName,
  setNewName,
  subjects,
  setSubjects,
}) 
{
    const saveEdit = () => {
        if (!newName.trim()) {
            Alert.alert('오류', '과목 이름을 입력하세요.');
            return;
        }

        setSubjects((subs) =>
            subs.map((subject) =>
                subject.id === editingSubject.id ? { ...subject, name: newName } : subject
            )
        );

        setVisible(false);
        setEditingSubject(null);
    };

    return (
        <EditSubjectModal
            visible={visible}
            newName={newName}
            setNewName={setNewName}
            onCancel={() => setVisible(false)}
            onSave={saveEdit}
        />
    );
}

export default EditSubject;
