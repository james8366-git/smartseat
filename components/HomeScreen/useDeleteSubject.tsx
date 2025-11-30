import { updateSubjects } from "../../lib/users";
import { useUserContext } from "../../contexts/UserContext";
import firestore from "@react-native-firebase/firestore";

export default function useDeleteSubject(subjects, setSubjects) {
  const { user } = useUserContext();

  const deleteSubject = async (id: string) => {
    if (!user?.uid) return;

    if (id === "base") {
      return;
    }

    const target = subjects.find((s) => s.id === id);
    if (!target) return;

    let updated = subjects.filter((s) => s.id !== id);

    let newSelectedName = null;

    if (target.selected && updated.length > 0) {
      updated = updated.map((s, index) =>
        index === 0 ? { ...s, selected: true } : { ...s, selected: false }
      );
      newSelectedName = updated[0].name;
    }

    setSubjects(updated);
    await updateSubjects(user.uid, updated);

    const userRef = firestore().collection("users").doc(user.uid);

    if (target.selected) {
      if (newSelectedName) {
        await userRef.update({ selectedSubject: newSelectedName });
      } else {
        await userRef.update({
          selectedSubject: firestore.FieldValue.delete(),
        });
      }
    }
  };

  return { deleteSubject };
}
