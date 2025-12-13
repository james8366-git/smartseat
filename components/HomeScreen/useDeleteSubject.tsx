// useDeleteSubject.tsx — FULL FINAL v3
// ✔ 삭제 Confirm
// ✔ base 이동
// ✔ todayTotalTime 재계산
// ✔ 삭제된 과목이 선택되어 있었다면 타이머 즉시 OFF + UI 강제 리프레시 반영

import { Alert } from "react-native";
import { useUserContext } from "../../contexts/UserContext";
import firestore from "@react-native-firebase/firestore";
import { updateTodayTotalTime } from "../../lib/timer";

export default function useDeleteSubject(subjects, setSubjects) {
  const { user } = useUserContext();

  const reallyDelete = async (id) => {
    const userRef = firestore().collection("users").doc(user.uid);

    const snap = await userRef.get();
    const data = snap.data();
    if (!data || !data.subject) return;

    const subjectMap = data.subject;

    const deletedTime = subjectMap[id]?.time ?? 0;
    const baseTime = subjectMap.base?.time ?? 0;

    const newSubjectMap = { ...subjectMap };
    delete newSubjectMap[id];
    newSubjectMap.base.time = baseTime + deletedTime;

    const deletingSelected = user.selectedSubject === id;

    try {
      // 🔥 1) Firestore 업데이트
      await userRef.update({
        subject: newSubjectMap,
        selectedSubject: deletingSelected ? "base" : user.selectedSubject,
      });

      // 🔥 2) todayTotalTime 재계산
      await updateTodayTotalTime(user.uid);

      // 🔥 3) 로컬 subject 리스트에서도 제거
      setSubjects(subjects.filter((s) => s.id !== id));

      // 🔥 4) 유저 상태 즉시 업데이트 (프론트 타이머 diff 즉시 종료)
      user.selectedSubject = deletingSelected ? "base" : user.selectedSubject;

      Alert.alert("삭제 완료", "과목이 삭제되었습니다.");
    } catch (e) {
      console.log("❌ deleteSubject ERROR:", e);
      Alert.alert("오류", "과목 삭제에 실패했습니다.");
    }
  };

  const deleteSubject = (id) => {
    if (id === "base") {
      Alert.alert("오류", "기본 과목은 삭제할 수 없습니다.");
      return;
    }

    Alert.alert(
      "과목 삭제",
      "정말 이 과목을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "삭제", style: "destructive", onPress: () => reallyDelete(id) },
      ]
    );
  };

  return { deleteSubject };
}
