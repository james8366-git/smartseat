// StudyList.tsx — 버튼 숨김 자동 처리 버전 (전체 파일)

import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";

import StudyItem from "./StudyItem";
import AddSubject from "./AddSubject";
import EditSubject from "./EditSubject";
import useDeleteSubject from "./useDeleteSubject";

import firestore from "@react-native-firebase/firestore";
import { useUserContext } from "../../contexts/UserContext";
import { updateSubjects, updateSelectedSubject } from "../../lib/users";

export default function StudyList({ subjectTimes, seatStatus }) {
    const { user } = useUserContext();
    const [subjects, setSubjects] = useState([]);

    /* SUBJECT SNAPSHOT */
    useEffect(() => {
        if (!user?.uid) return;

        return firestore()
        .collection("users")
        .doc(user.uid)
        .onSnapshot((snap) => {
            if (!snap.exists) return;

            const map = snap.data().subject || {};

            const arr = Object.entries(map).map(([id, s]) => ({
                id,
                name: s.name,
                time: s.time ?? 0,
            }));

            setSubjects(arr);
        });
    }, [user?.uid]);

    const { deleteSubject } = useDeleteSubject(subjects, setSubjects);

    /* ----------------------------------------------------
    * toggleSelect (occupied → 차단)
    * ---------------------------------------------------- */
    const toggleSelect = async (newId) => {
        const oldId = user.selectedSubject;

        if (oldId === newId) return;
        if (seatStatus === "occupied") return;

        await updateSelectedSubject(user.uid, newId);
    };

    /* ----------------------------------------------------
    * 삭제/편집 요청
    * ---------------------------------------------------- */
    const requestDelete = async (id) => {
        const selectedId = user.selectedSubject;

        if (seatStatus === "occupied" && id === selectedId) return;

        deleteSubject(id);
    };

    const requestEdit = (subject) => {
        const selectedId = user.selectedSubject;

        if (seatStatus === "occupied" && subject.id === selectedId) return;

        setEditingSubject(subject);
        setNewName(subject.name);
        setEditVisible(true);
    };

    /* EDIT UI */
    const [editVisible, setEditVisible] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);
    const [newName, setNewName] = useState("");

    const syncToFirestore = async (updated) => {
        await updateSubjects(user.uid, updated);
    };

    return (
        <>
            <FlatList
                data={subjects}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {

                const isSelected = user.selectedSubject === item.id;
                const isBlocked = seatStatus === "occupied" && isSelected;

                return (
                    <StudyItem
                        subject={item}
                        subjectTimes={subjectTimes}
                        selected={isSelected}

                        onPress={() => toggleSelect(item.id)}
                        onLongPress={() => requestEdit(item)}
                        onDelete={() => requestDelete(item.id)}

                        //  자동 비활성화 전달
                        disabledPress={isBlocked}
                        disabledEdit={isBlocked}
                        disabledDelete={isBlocked}
                    />
                );
                }}
            />

            <AddSubject subjects={subjects} />

            <EditSubject
                visible={editVisible}
                setVisible={setEditVisible}
                editingSubject={editingSubject}
                newName={newName}
                setNewName={setNewName}
                subjects={subjects}
                syncToFirestore={syncToFirestore}
            />
        </>
    );
}
