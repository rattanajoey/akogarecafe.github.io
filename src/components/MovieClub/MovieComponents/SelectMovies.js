import { db } from "../../../config/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getPreviousMonth = () => {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const SelectMovies = async () => {
  const currentMonth = getCurrentMonth();
  const previousMonth = getPreviousMonth();

  const prevSelectionRef = doc(db, "MonthlySelections", previousMonth);
  const prevSelectionSnap = await getDocs(prevSelectionRef);
  const prevMovies = prevSelectionSnap.exists() ? prevSelectionSnap.data() : {};

  const prevSubmissionsRef = collection(db, "Submissions", previousMonth);
  const prevSnapshot = await getDocs(prevSubmissionsRef);

  const newSubmissions = [];

  prevSnapshot.docs.forEach((doc) => {
    const data = doc.data();

    const newSubmission = {
      accessCode: data.accessCode,
      action:
        data.action && data.action !== prevMovies.action ? data.action : "",
      drama: data.drama && data.drama !== prevMovies.drama ? data.drama : "",
      comedy:
        data.comedy && data.comedy !== prevMovies.comedy ? data.comedy : "",
      thriller:
        data.thriller && data.thriller !== prevMovies.thriller
          ? data.thriller
          : "",
      submittedAt: new Date(),
    };

    if (
      newSubmission.action ||
      newSubmission.drama ||
      newSubmission.comedy ||
      newSubmission.thriller
    ) {
      newSubmissions.push({ nickname: doc.id, ...newSubmission });
    }
  });

  for (const submission of newSubmissions) {
    await setDoc(
      doc(db, "Submissions", currentMonth, submission.nickname),
      submission
    );
  }
};
