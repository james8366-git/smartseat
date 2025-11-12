import React, { useState } from 'react';
import { FlatList } from 'react-native';
import StudyItem from './StudyItem';
import AddSubject from './AddSubject';
import EditSubject from './EditSubject';

function StudyList({ subjects, setSubjects }) {
    const [editmodalVisible, setEditModalVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [newName, setNewName] = useState('');

    const toggleSelect = (id) => {
            setSubjects((prev) =>
            prev.map(
                (subject) => 
                (
                    { ...subject, selected: subject.id === id }
                )
            )
        );
    };

    const deleteSubject = (id) => {
        if (id === '0') return;
        setSubjects(
            (subjects) => subjects.filter((subject) => subject.id !== id)
        );
    };

    const openEditModal = (subject) => {
        if (subject.id === '0') return;
        setEditingSubject(subject);
        setNewName(subject.name);
        setEditModalVisible(true);
    };

    return (
        <>
            <FlatList
                data={subjects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => 
                    (
                        <StudyItem
                            item={item}
                            onSelect={toggleSelect}
                            onEdit={openEditModal}
                            onDelete={deleteSubject}
                        />
                    )
                }
                ListFooterComponent={
                    <AddSubject subjects={subjects} setSubjects={setSubjects} />
                }
            />

            <EditSubject
                visible={editmodalVisible}
                setVisible={setEditModalVisible}
                editingSubject={editingSubject}
                setEditingSubject={setEditingSubject}
                newName={newName}
                setNewName={setNewName}
                subjects={subjects}
                setSubjects={setSubjects}
            />
        </>
    );
}

export default StudyList;
