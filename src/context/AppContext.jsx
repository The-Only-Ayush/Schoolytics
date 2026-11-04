
import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import { initialAssignments } from "../data/initialAssignments";

export const AppContext = createContext();

export function useAppContext() {
  return useContext(AppContext);
}


export function AppProvider({ children }) {

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [assignments, setAssignments] = useState(() => {
    const savedAssignments = localStorage.getItem("assignments");

    return savedAssignments
      ? JSON.parse(savedAssignments)
      : initialAssignments;
  });

  
  useEffect(() => {
    localStorage.setItem(
      "assignments",
      JSON.stringify(assignments)
    );
  }, [assignments]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
      );
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  
  const createAssignment = (newAssignment) => {
    const assignment = {
      ...newAssignment,
      id: Date.now(),
      submittedBy: [],
    };

    setAssignments((prevAssignments) => [
      ...prevAssignments,
      assignment,
    ]);
  };


  
  const updateAssignment = (id, updatedData) => {
    setAssignments((prevAssignments) =>
      prevAssignments.map((assignment) =>
        assignment.id === id
          ? { ...assignment, ...updatedData }
          : assignment
      )
    );
  };

  const deleteAssignment = (id) => {
    setAssignments((prevAssignments) =>
      prevAssignments.filter(
        (assignment) => assignment.id !== id
      )
    );
  };


  
  const submitAssignment = (assignmentId, studentId) => {
    setAssignments((prevAssignments) =>
      prevAssignments.map((assignment) => {
        if (assignment.id === assignmentId) {
          if (assignment.submittedBy.includes(studentId)) {
            return assignment;
          }

          return {
            ...assignment,
            submittedBy: [
              ...assignment.submittedBy,
              studentId,
            ],
          };
        }

        return assignment;
      })
    );
  };


  
  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        assignments,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        submitAssignment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}


