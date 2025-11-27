import React, { useState } from "react";
import { FlatList } from "react-native";
import StudyItem from "./StudyItem";
import AddSubject from "./AddSubject";
import EditSubject from "./EditSubject";
import useDeleteSubject from "./DeleteSubject";
import { updateSubjects, updateSelectedSubject } from "../../lib/users";
import { useUserContext } from "../../contexts/UserContext";
import functions from "@react-native-firebase/functions";

function StudyList({ subjects, setSubjects }) {
  const { user } = useUserContext();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newName, setNewName] = useState("");

  const { deleteSubject } = useDeleteSubject(subjects, setSubjects);

  const syncToFirestore = async (updated) => {
    await updateSubjects(user.uid, updated);
  };

  const toggleSelect = async (id) => {
    const selected = subjects.find((s) => s.id === id);
    const subjectName = selected?.name ?? "";
    console.log(subjectName);

    // 프론트에서 user 문서 업데이트
    await updateSelectedSubject(user.uid, subjectName);

    // StudyList UI 업데이트
    const updated = subjects.map((s) => ({
      ...s,
      selected: s.id === id,
    }));

    setSubjects(updated);
    syncToFirestore(updated);

    // 🔥 Cloud Function 호출
        if (user.seatId) {
        await functions()
            .httpsCallableFromUrl(
            "https://asia-northeast3-dbtest-1c893.cloudfunctions.net/changeSubject"
            )({
            subjectName,
            seatId: user.seatId,
            });
        }
  }

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
          <AddSubject subjects={subjects} setSubjects={setSubjects} />
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
