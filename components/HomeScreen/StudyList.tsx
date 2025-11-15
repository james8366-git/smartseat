import React, { useState } from "react";
import { FlatList } from "react-native";
import StudyItem from "./StudyItem";
import AddSubject from "./AddSubject";
import EditSubject from "./EditSubject";
import useDeleteSubject from "./DeleteSubject";
import { updateSubjects } from "../../lib/users";
import { useUserContext } from "../../contexts/UserContext";

function StudyList({ subjects, setSubjects }) {
  const { user } = useUserContext();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newName, setNewName] = useState("");

  const { deleteSubject } = useDeleteSubject(subjects, setSubjects);

  const syncToFirestore = async (updated) => {
    await updateSubjects(user.uid, updated);
  };

  const toggleSelect = (id) => {
    const updated = subjects.map((s) => ({
      ...s,
      selected: s.id === id,
    }));

    setSubjects(updated);
    syncToFirestore(updated);
  };

  const openEditModal = (subject) => {
    if (subject.id === "0") return;
    setEditingSubject(subject);
    setNewName(subject.name);
    setEditModalVisible(true);
  };

  return (
    <>
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudyItem
            item={item}
            onSelect={toggleSelect}
            onEdit={() => openEditModal(item)}
            onDelete={() => deleteSubject(item.id)}
          />
        )}
        ListFooterComponent={
          <AddSubject
            subjects={subjects}
            setSubjects={setSubjects}
          />
        }
      />

      <EditSubject
        visible={editModalVisible}
        setVisible={setEditModalVisible}
        editingSubject={editingSubject}
        newName={newName}
        setNewName={setNewName}
        subjects={subjects}
        setSubjects={setSubjects}
        syncToFirestore={syncToFirestore}
      />
    </>
  );
}

export default StudyList;
