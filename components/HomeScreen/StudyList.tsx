// components/HomeScreen/StudyList.tsx
import React, { useState, useMemo } from "react";
import { FlatList } from "react-native";
import StudyItem from "./StudyItem";
import AddSubject from "./AddSubject";
import EditSubject from "./EditSubject";
import useDeleteSubject from "./useDeleteSubject";

import firestore from "@react-native-firebase/firestore";
import { flushSubject, beginSubject } from "../../lib/timer";
import { getSubjects } from "../../lib/users";

export default function StudyList({
  user,
  subjects,
  setSubjects,
  subjectTimes,
  seatStatus,
}) {
  const uid = user.uid;

  const [editVisible, setEditVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newName, setNewName] = useState("");

  const { deleteSubject } = useDeleteSubject(subjects, setSubjects);

  /** 현재 selected */
  const current = subjects.find((s) => s.name === user.selectedSubject);
  const currentId = current?.id ?? null;

  /** base(공부)는 맨 위 */
  const sortedSubjects = useMemo(() => {
    const base = subjects.find((s) => s.id === "base");
    const rest = subjects.filter((s) => s.id !== "base");
    return base ? [base, ...rest] : subjects;
  }, [subjects]);

  /** -------------------------------------------------------------
   * 과목 선택
   * ------------------------------------------------------------- */
  const toggleSelect = async (id: string) => {
    const newSub = subjects.find((s) => s.id === id);
    if (!newSub) return;

    const newSubjectName = newSub.name;

    const current = subjects.find((s) => s.selected);
    const currentId = current?.id ?? null;

    const isRunning = !!user.runningSubjectSince;
    const userRef = firestore().collection("users").doc(uid);

    /** 1) 이전 과목 flush: 착석 중일 때만 */
    if (seatStatus === "occupied" && isRunning && currentId) {
      await flushSubject({
        uid,
        subjectId: currentId,
        runningSubjectSince: user.runningSubjectSince,
      });
    }

    /** 2) selectedSubject 업데이트 */
    await userRef.update({
      selectedSubject: newSubjectName,
    });

    /** 3) 좌석 상태에 따라 새 과목 세션 처리 */
    if (seatStatus === "occupied") {
      await beginSubject({
        uid,
        newSubject: newSubjectName,
      });
    } else {
      // empty / none / object 상태
      await userRef.update({
        runningSubjectSince: null,
      });
    }

    /** 4) subject.<id>.selected 만 업데이트 (time 절대 건드리면 안됨) */
    const batch = firestore().batch();
    subjects.forEach((s) => {
      batch.update(userRef, {
        [`subject.${s.id}.selected`]: s.id === id,
      });
    });
    await batch.commit();

    /** 5) DB에서 최신 subjects 다시 불러오기 (UI 초기화 방지의 핵심!!) */
    const fresh = await getSubjects(uid);
    setSubjects(fresh);
  };

  return (
    <>
      <FlatList
        data={sortedSubjects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudyItem
            item={item}
            selectedId={currentId}
            subjectUiTime={subjectTimes[item.id] ?? 0} // 초 단위 UI 시간
            onSelect={() => toggleSelect(item.id)}
            onDelete={() => {
              if (item.id === "base") return; // base 삭제 금지
              deleteSubject(item.id);
            }}
            onEdit={() => {
              if (item.id === "base") return; // base 수정 금지
              setEditingSubject(item);
              setNewName(item.name);
              setEditVisible(true);
            }}
          />
        )}
        ListFooterComponent={
          <AddSubject subjects={subjects} setSubjects={setSubjects} />
        }
      />

      <EditSubject
        visible={editVisible}
        setVisible={setEditVisible}
        editingSubject={editingSubject}
        newName={newName}
        setNewName={setNewName}
        subjects={subjects}
        setSubjects={setSubjects}
        syncToFirestore={() => {}}
      />
    </>
  );
}
