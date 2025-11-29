import { updateSubjects } from "../../lib/users";
import { useUserContext } from "../../contexts/UserContext";

export default function useDeleteSubject(subjects, setSubjects) {
  const { user } = useUserContext();

    const deleteSubject = async (id) => {
    if (id === "0") return;

    const updated = subjects.filter((s) => s.id !== id);

    // 🔥 삭제한 과목이 selected였으면
    const deletedWasSelected = subjects.find(s => s.id === id)?.selected;

    // subjects 업데이트
    setSubjects(updated);
    await updateSubjects(user.uid, updated);

    if (deletedWasSelected) {
        // 🔥 첫 번째 과목을 선택된 과목으로 설정
        const newSelected = updated[0];
        if (newSelected) {
        newSelected.selected = true;

        setSubjects([...updated]);
        await updateSubjects(user.uid, updated);

        await firestore()
            .collection("users")
            .doc(user.uid)
            .update({
            selectedSubject: newSelected.name,
            });
        }
    }
};

}
