function DeleteSubject({ subjects, setSubjects }) {
    const deleteSubject = (id) => {
        if (id === '0') return;
        setSubjects(subjects.filter((s) => s.id !== id));
    };

    return { deleteSubject };
}

export default DeleteSubject;
