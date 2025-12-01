// components/HomeScreen/StudyList.tsx — FINAL STABLE VERSION

import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";

import StudyItem from "./StudyItem";
import AddSubject from "./AddSubject";
import EditSubject from "./EditSubject";
import useDeleteSubject from "./useDeleteSubject";

import { useUserContext } from "../../contexts/UserContext";
import { updateSelectedSubject } from "../../lib/users";
import firestore from "@react-native-firebase/firestore";

export default function StudyList({ subjectTimes }) {
  const { user } = useUserContext();
  const [subjects, setSubjects] = useState([]);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newName, setNewName] = useState("");

  /* SUBJECT SNAPSHOT (전담관리) */
  useEffect(() => {
    if (!user?.uid) return;

    return firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot((snap) => {
        if (!snap.exists) return;

        const data = snap.data();
        const map = data.subject || {};

        const arr = Object.entries(map).map(([id, s]) => ({
          id,
          name: s.name,
          time: s.time ?? 0,
        }));

        setSubjects(arr);
      });
  }, [user?.uid]);

  const { deleteSubject } = useDeleteSubject(subjects, setSubjects);

  const toggleSelect = async (id) => {
    const current = user.selectedSubject;
    const next = current === id ? null : id;
    await updateSelectedSubject(user.uid, next);
  };

  const openEdit = (subject) => {
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
            subject={item}
            selected={user.selectedSubject === item.id}
            subjectTimes={subjectTimes}   // 안정된 시간
            onPress={() => toggleSelect(item.id)}
            onLongPress={() => openEdit(item)}
            onDelete={() => deleteSubject(item.id)}
          />
        )}
      />

      <AddSubject subjects={subjects} setSubjects={setSubjects} />

      <EditSubject
        visible={editModalVisible}
        setVisible={setEditModalVisible}
        editingSubject={editingSubject}
        newName={newName}
        setNewName={setNewName}
        subjects={subjects}
        syncToFirestore={setSubjects}
      />
    </>
  );
}
