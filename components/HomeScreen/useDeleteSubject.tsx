// useDeleteSubject.tsx — FINAL (base 흡수 방식)

import { Alert } from "react-native";
import { useUserContext } from "../../contexts/UserContext";
import firestore from "@react-native-firebase/firestore";

export default function useDeleteSubject(subjects, setSubjects) {
    const { user } = useUserContext();

    const reallyDelete = async (id) => {
        const userRef = firestore().collection("users").doc(user.uid);

        const snap = await userRef.get();
        const data = snap.data();
        if (!data?.subject) return;

        const subjectMap = data.subject;

        const deletedTime = subjectMap[id]?.time ?? 0;
        const baseTime = subjectMap.base?.time ?? 0;

        const newSubjectMap = { ...subjectMap };
        delete newSubjectMap[id];

        newSubjectMap.base = {
            ...newSubjectMap.base,
            time: baseTime + deletedTime,
        };

        const deletingSelected = user.selectedSubject === id;

        try {
            await userRef.update({
                subject: newSubjectMap,
                selectedSubject: deletingSelected ? "base" : user.selectedSubject,
            });

            setSubjects(subjects.filter((s) => s.id !== id));

            if (deletingSelected) {
                user.selectedSubject = "base";
            }

                Alert.alert("삭제 완료", "과목이 삭제되었습니다.");
            } 
        catch (e) 
            {
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
