import { updateSubjects } from "../../lib/users";
import { useUserContext } from "../../contexts/UserContext";

export default function useDeleteSubject(subjects, setSubjects) {
  const { user } = useUserContext();

  const deleteSubject = async (id) => {
    if (id === "0") return; // 공부는 삭제 못 함

    const updated = subjects.filter((s) => s.id !== id)
      .map((s, idx) => ({ ...s, id: idx.toString() })); // index 재정렬

    setSubjects(updated);
    await updateSubjects(user.uid, updated);
  };

  return { deleteSubject };
}
