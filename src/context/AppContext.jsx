
import { createContext, useContext, useState, useEffect } from "react";
import { initialAssignments } from "../data/initialAssignments";
import { initialCourses } from "../data/initialCourses";
import { students, teachers } from "../data/accounts";

export const AppContext = createContext();

export function useAppContext() {
  return useContext(AppContext);
}

const generateToken = () => {
  if (crypto.randomUUID) {
    return `mock-jwt-${crypto.randomUUID()}`;
  }

  return `mock-jwt-${Date.now()}-${Math.random()}`;
};

const demoUsers = [
  ...students.map((user) => ({
    ...user,
    role: "student",
    password: "demo123",
  })),
  ...teachers.map((user) => ({
    ...user,
    role: "admin",
    password: "demo123",
  })),
];

export function AppProvider({ children }) {
  // Authentication state
  const [currentUser, setCurrentUserState] = useState(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("currentUser");

    if (!savedToken || !savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("authToken") || null
  );

  // Assignment state
  const [assignments, setAssignments] = useState(() => {
    try {
      const savedAssignments = localStorage.getItem("assignments");

      return savedAssignments
        ? JSON.parse(savedAssignments)
        : initialAssignments;
    } catch {
      return initialAssignments;
    }
  });

  // Course state
  const [courses, setCourses] = useState(() => {
    try {
      const savedCourses = localStorage.getItem("courses");

      return savedCourses
        ? JSON.parse(savedCourses)
        : initialCourses;
    } catch {
      return initialCourses;
    }
  });

  // Group state
  const [groups, setGroups] = useState(() => {
    try {
      const savedGroups = localStorage.getItem("groups");

      return savedGroups ? JSON.parse(savedGroups) : [];
    } catch {
      return [];
    }
  });

  // Persist assignments
  useEffect(() => {
    localStorage.setItem("assignments", JSON.stringify(assignments));
  }, [assignments]);

  // Persist courses
  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses));
  }, [courses]);

  // Persist groups
  useEffect(() => {
    localStorage.setItem("groups", JSON.stringify(groups));
  }, [groups]);

  // Persist authentication
  useEffect(() => {
    if (currentUser && token) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("authToken");
    }
  }, [currentUser, token]);

  // Authentication functions
  const setCurrentUser = (user) => {
    if (user) {
      setCurrentUserState(user);

      const newToken =
        localStorage.getItem("authToken") || generateToken();

      setToken(newToken);
    } else {
      setCurrentUserState(null);
      setToken(null);
    }
  };

  const login = (email, password) => {
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );

    const allUsers = [...demoUsers, ...registeredUsers];

    const user = allUsers.find(
      (account) =>
        account.email.toLowerCase() === email.toLowerCase() &&
        account.password === password
    );

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    const { password: ignoredPassword, ...safeUser } = user;

    const newToken = generateToken();

    setCurrentUserState(safeUser);
    setToken(newToken);

    return {
      success: true,
      user: safeUser,
      token: newToken,
    };
  };

  const register = (userData) => {
    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );

    const emailExists = [...demoUsers, ...registeredUsers].some(
      (user) =>
        user.email.toLowerCase() === userData.email.toLowerCase()
    );

    if (emailExists) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
      initials: userData.name
        .trim()
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2),
      role: userData.role === "professor" ? "admin" : "student",
    };

    localStorage.setItem(
      "registeredUsers",
      JSON.stringify([...registeredUsers, newUser])
    );

    return {
      success: true,
      message: "Registration successful. Please log in.",
    };
  };

  const logout = () => {
    setCurrentUserState(null);
    setToken(null);

    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");
  };

  // Assignment functions
  const createAssignment = (newAssignment) => {
    const assignment = {
      ...newAssignment,
      id: Date.now(),
      submittedBy: [],
      groupSubmissions: [],
    };

    setAssignments((prev) => [...prev, assignment]);

    return assignment;
  };

  const updateAssignment = (id, updatedData) => {
    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === id
          ? { ...assignment, ...updatedData }
          : assignment
      )
    );
  };

  const deleteAssignment = (id) => {
    setAssignments((prev) =>
      prev.filter((assignment) => assignment.id !== id)
    );
  };

  // Individual assignment acknowledgement
  const submitAssignment = (assignmentId, studentId) => {
    setAssignments((prev) =>
      prev.map((assignment) => {
        if (String(assignment.id) !== String(assignmentId)) {
          return assignment;
        }

        const submittedBy = assignment.submittedBy || [];

        if (
          submittedBy.some(
            (id) => String(id) === String(studentId)
          )
        ) {
          return assignment;
        }

        return {
          ...assignment,
          submittedBy: [...submittedBy, studentId],
        };
      })
    );
  };

  // Group assignment acknowledgement
  const acknowledgeGroupAssignment = (assignmentId, groupId) => {
    if (!currentUser || currentUser.role !== "student") {
      return {
        success: false,
        message: "Only students can acknowledge assignments.",
      };
    }

    const assignment = assignments.find(
      (item) => String(item.id) === String(assignmentId)
    );

    if (!assignment) {
      return {
        success: false,
        message: "Assignment not found.",
      };
    }

    if (assignment.submissionType !== "group") {
      return {
        success: false,
        message: "This is not a group assignment.",
      };
    }

    const group = groups.find(
      (item) =>
        String(item.id) === String(groupId) &&
        String(item.courseId) === String(assignment.courseId)
    );

    if (!group) {
      return {
        success: false,
        message: "Group not found for this course.",
      };
    }

    if (
      !group.members.some(
        (id) => String(id) === String(currentUser.id)
      )
    ) {
      return {
        success: false,
        message: "You are not a member of this group.",
      };
    }

    if (String(group.leaderId) !== String(currentUser.id)) {
      return {
        success: false,
        message: "Only the group leader can acknowledge this assignment.",
      };
    }

    const groupSubmissions = assignment.groupSubmissions || [];

    const alreadyAcknowledged = groupSubmissions.some(
      (submission) =>
        String(submission.groupId) === String(group.id)
    );

    if (alreadyAcknowledged) {
      return {
        success: false,
        message: "Your group has already acknowledged this assignment.",
      };
    }

    const acknowledgedAt = new Date().toISOString();

    setAssignments((prev) =>
      prev.map((item) => {
        if (String(item.id) !== String(assignmentId)) {
          return item;
        }

        const existingSubmissions = item.groupSubmissions || [];

        // Prevent duplicate acknowledgement
        if (
          existingSubmissions.some(
            (submission) =>
              String(submission.groupId) === String(group.id)
          )
        ) {
          return item;
        }

        return {
          ...item,
          groupSubmissions: [
            ...existingSubmissions,
            {
              groupId: group.id,
              leaderId: currentUser.id,
              acknowledgedAt,
            },
          ],
        };
      })
    );

    return {
      success: true,
      message: "Group assignment acknowledged successfully.",
      acknowledgedAt,
    };
  };

  // Course functions
  const createCourse = (newCourse) => {
    const course = {
      ...newCourse,
      id: Date.now(),
      createdBy: currentUser.id,
      enrolledStudents: newCourse.enrolledStudents || [],
    };

    setCourses((prev) => [...prev, course]);

    return course;
  };

  const updateCourse = (id, updatedData) => {
    setCourses((prev) =>
      prev.map((course) =>
        course.id === id
          ? { ...course, ...updatedData }
          : course
      )
    );
  };

  const deleteCourse = (id) => {
    setCourses((prev) =>
      prev.filter((course) => String(course.id) !== String(id))
    );

    setGroups((prev) =>
      prev.filter((group) => String(group.courseId) !== String(id))
    );
  };

  const enrollStudent = (courseId, studentId) => {
    setCourses((prev) =>
      prev.map((course) => {
        if (String(course.id) === String(courseId)) {
          if (
            course.enrolledStudents.some(
              (id) => String(id) === String(studentId)
            )
          ) {
            return course;
          }

          return {
            ...course,
            enrolledStudents: [
              ...course.enrolledStudents,
              studentId,
            ],
          };
        }

        return course;
      })
    );
  };

  // Group functions

  // Create a group
  const createGroup = (courseId, groupName) => {
    if (!currentUser || currentUser.role !== "student") {
      return {
        success: false,
        message: "Only students can create groups.",
      };
    }

    const course = courses.find(
      (course) => String(course.id) === String(courseId)
    );

    if (!course) {
      return {
        success: false,
        message: "Course not found.",
      };
    }

    const isEnrolled = course.enrolledStudents.some(
      (id) => String(id) === String(currentUser.id)
    );

    if (!isEnrolled) {
      return {
        success: false,
        message: "You are not enrolled in this course.",
      };
    }

    const alreadyInGroup = groups.some(
      (group) =>
        String(group.courseId) === String(courseId) &&
        group.members.some(
          (id) => String(id) === String(currentUser.id)
        )
    );

    if (alreadyInGroup) {
      return {
        success: false,
        message: "You are already in a group for this course.",
      };
    }

    if (!groupName?.trim()) {
      return {
        success: false,
        message: "Please enter a group name.",
      };
    }

    const newGroup = {
      id: `group-${Date.now()}`,
      courseId,
      name: groupName.trim(),
      leaderId: currentUser.id,
      members: [currentUser.id],
      createdAt: new Date().toISOString(),
    };

    setGroups((prev) => [...prev, newGroup]);

    return {
      success: true,
      message: "Group created successfully.",
      group: newGroup,
    };
  };

  // Join an existing group
  const joinGroup = (courseId, groupId) => {
    if (!currentUser || currentUser.role !== "student") {
      return {
        success: false,
        message: "Only students can join groups.",
      };
    }

    const course = courses.find(
      (course) => String(course.id) === String(courseId)
    );

    if (!course) {
      return {
        success: false,
        message: "Course not found.",
      };
    }

    const isEnrolled = course.enrolledStudents.some(
      (id) => String(id) === String(currentUser.id)
    );

    if (!isEnrolled) {
      return {
        success: false,
        message: "You are not enrolled in this course.",
      };
    }

    const targetGroup = groups.find(
      (group) =>
        String(group.id) === String(groupId) &&
        String(group.courseId) === String(courseId)
    );

    if (!targetGroup) {
      return {
        success: false,
        message: "Group not found.",
      };
    }

    const alreadyInGroup = groups.some(
      (group) =>
        String(group.courseId) === String(courseId) &&
        group.members.some(
          (id) => String(id) === String(currentUser.id)
        )
    );

    if (alreadyInGroup) {
      return {
        success: false,
        message: "You are already in a group for this course.",
      };
    }

    setGroups((prev) =>
      prev.map((group) =>
        String(group.id) === String(groupId)
          ? {
              ...group,
              members: [...group.members, currentUser.id],
            }
          : group
      )
    );

    return {
      success: true,
      message: "You joined the group successfully.",
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        token,
        login,
        register,
        logout,

        assignments,
        createAssignment,
        updateAssignment,
        deleteAssignment,
        submitAssignment,
        acknowledgeGroupAssignment,

        courses,
        createCourse,
        updateCourse,
        deleteCourse,
        enrollStudent,

        groups,
        createGroup,
        joinGroup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
