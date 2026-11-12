
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Moon,
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardList,
  Users,
  Plus,
  UserPlus,
  Crown,
  BookOpen,
  AlertTriangle,
  X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { students } from "../data/accounts";

function StudentDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    currentUser,
    assignments,
    courses,
    groups,
    setCurrentUser,
    submitAssignment,
    acknowledgeGroupAssignment,
    createGroup,
    joinGroup,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState(1);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [groupNames, setGroupNames] = useState({});
  const [groupMessage, setGroupMessage] = useState("");
  const [submissionMessage, setSubmissionMessage] = useState("");

  if (!currentUser || currentUser.role !== "student") {
    return null;
  }

  // Get the current student's group in a course
  const getCourseGroup = (courseId) => {
    return (groups || []).find(
      (group) =>
        String(group.courseId) === String(courseId) &&
        group.members?.some(
          (id) => String(id) === String(currentUser.id)
        )
    );
  };

  // Check whether an assignment is completed
  const isAssignmentCompleted = (assignment) => {
    if (assignment.submissionType === "group") {
      const studentGroup = getCourseGroup(assignment.courseId);

      if (!studentGroup) return false;

      return (assignment.groupSubmissions || []).some(
        (submission) =>
          String(submission.groupId) === String(studentGroup.id)
      );
    }

    return assignment.submittedBy?.some(
      (id) => String(id) === String(currentUser.id)
    );
  };

  // Check whether an assignment deadline has passed
  const isOverdue = (assignment) => {
    if (isAssignmentCompleted(assignment) || !assignment.dueDate) {
      return false;
    }

    const deadline = new Date(
      `${assignment.dueDate}T${assignment.dueTime || "23:59"}`
    );

    if (Number.isNaN(deadline.getTime())) return false;

    return new Date() > deadline;
  };

  // Get group acknowledgement details
  const getGroupSubmission = (assignment, group) => {
    return (assignment.groupSubmissions || []).find(
      (submission) =>
        String(submission.groupId) === String(group.id)
    );
  };

  // Get individual acknowledgement details, including its timestamp.
  const getIndividualSubmission = (assignment) => {
    return (assignment.individualSubmissions || []).find(
      (submission) =>
        String(submission.studentId) === String(currentUser.id)
    );
  };

  // Get student details
  const getStudentDetails = (studentId) => {
    if (String(studentId) === String(currentUser.id)) {
      return currentUser;
    }

    const registeredUsers = JSON.parse(
      localStorage.getItem("registeredUsers") || "[]"
    );

    return (
      students.find(
        (student) => String(student.id) === String(studentId)
      ) ||
      registeredUsers.find(
        (student) => String(student.id) === String(studentId)
      ) || {
        name: `Student ${studentId}`,
        initials: "S",
      }
    );
  };

  // Get assignments assigned to the current student
  const studentAssignments = assignments.filter((assignment) => {
    const assignedTo = assignment.assignedTo;

    return (
      assignedTo === "all" ||
      (Array.isArray(assignedTo) &&
        assignedTo.some(
          (id) => String(id) === String(currentUser.id)
        ))
    );
  });

  // Calculate completed and pending assignments
  const completedAssignments = studentAssignments.filter(
    isAssignmentCompleted
  );

  const pendingAssignments = studentAssignments.filter(
    (assignment) => !isAssignmentCompleted(assignment)
  );

  const totalAssignments = studentAssignments.length;
  const completedCount = completedAssignments.length;
  const pendingCount = pendingAssignments.length;

  const progress =
    totalAssignments === 0
      ? 0
      : Math.round((completedCount / totalAssignments) * 100);

  // Filter assignments according to sidebar tab
  let displayedAssignments = studentAssignments;

  if (activeTab === "Completed") {
    displayedAssignments = completedAssignments;
  } else if (activeTab === "Pending") {
    displayedAssignments = pendingAssignments;
  }

  // Search assignments
  displayedAssignments = displayedAssignments.filter((assignment) => {
    const query = searchQuery.toLowerCase();

    return (
      assignment.title?.toLowerCase().includes(query) ||
      assignment.description?.toLowerCase().includes(query)
    );
  });

  // Get enrolled courses
  const studentCourses = (courses || []).filter((course) =>
    course.enrolledStudents?.some(
      (id) => String(id) === String(currentUser.id)
    )
  );

  // Get all groups for a course
  const getCourseGroups = (courseId) => {
    return (groups || []).filter(
      (group) => String(group.courseId) === String(courseId)
    );
  };

  // Logout
  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  // Open submission confirmation
  const handleSubmitClick = (assignment) => {
    setSubmissionMessage("");
    setSelectedAssignment(assignment);
    setDialogStep(1);
    setIsDialogOpen(true);
  };

  const handleNextStep = () => {
    setDialogStep(2);
  };

  // Confirm individual or group acknowledgement
  const handleConfirmSubmission = () => {
    if (!selectedAssignment) return;

    if (selectedAssignment.submissionType === "group") {
      const studentGroup = getCourseGroup(
        selectedAssignment.courseId
      );

      if (!studentGroup) {
        showToast(
          "You are not part of any group. Create or join one first.",
          "error"
        );

        setIsDialogOpen(false);
        setSelectedAssignment(null);
        setDialogStep(1);
        return;
      }

      if (
        String(studentGroup.leaderId) !== String(currentUser.id)
      ) {
        showToast(
          "Only your group leader can acknowledge this assignment.",
          "error"
        );

        setIsDialogOpen(false);
        setSelectedAssignment(null);
        setDialogStep(1);
        return;
      }

      const result = acknowledgeGroupAssignment(
        selectedAssignment.id,
        studentGroup.id
      );

      if (result.success) {
        showToast(result.message, "success");
      } else {
        showToast(result.message, "error");
      }
    } else {
      submitAssignment(selectedAssignment.id, currentUser.id);

      showToast(
        "Assignment acknowledged successfully.",
        "success"
      );
    }

    setIsDialogOpen(false);
    setSelectedAssignment(null);
    setDialogStep(1);
  };

  const handleCancelSubmission = () => {
    setIsDialogOpen(false);
    setSelectedAssignment(null);
    setDialogStep(1);
  };

  // Create group
  const handleCreateGroup = (courseId) => {
    const groupName = groupNames[courseId]?.trim();

    if (!groupName) {
      showToast("Please enter a group name.", "error");
      return;
    }

    const result = createGroup(courseId, groupName);

    if (result?.success) {
      showToast(result.message, "success");

      setGroupNames((previous) => ({
        ...previous,
        [courseId]: "",
      }));
    } else {
      showToast(
        result?.message || "Unable to create group.",
        "error"
      );
    }
  };

  // Join group
  const handleJoinGroup = (courseId, groupId) => {
    const result = joinGroup(courseId, groupId);

    if (result?.success) {
      showToast(result.message, "success");
    } else {
      showToast(
        result?.message || "Unable to join this group.",
        "error"
      );
    }
  };

  const handleGoToGroups = () => {
    setActiveTab("Groups");
    setSearchQuery("");
    setSubmissionMessage("");
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Upcoming assignments
  const upcomingAssignments = [...pendingAssignments]
    .sort(
      (a, b) =>
        new Date(a.dueDate) - new Date(b.dueDate)
    )
    .slice(0, 3);

  const isGroupsTab = activeTab === "Groups";

  return (
    <div className="min-h-screen w-full max-w-full bg-[#F7F8F0] flex overflow-x-hidden">
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearchQuery("");
          setGroupMessage("");
          setSubmissionMessage("");
        }}
        onLogout={handleLogout}
        counts={{
          total: totalAssignments,
          completed: completedCount,
          pending: pendingCount,
        }}
      />

      <main className="flex-1 min-w-0 w-full max-w-full p-5 pt-20 md:p-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 min-w-0">
          <div className="min-w-0">
            <p className="text-sm text-[#526273]">
              Student Dashboard
            </p>

            <h1 className="text-2xl md:text-3xl font-bold text-[#173D59] mt-1">
              {isGroupsTab
                ? "My Groups"
                : activeTab === "Dashboard"
                  ? "Dashboard Overview"
                  : activeTab + " Assignments"}
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto min-w-0">
            <div className="relative flex-1 min-w-0 md:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526273]"
              />

              <input
                type="text"
                placeholder={
                  isGroupsTab
                    ? "Search courses..."
                    : "Search assignments..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E0E6E4] text-sm text-[#173D59] outline-none focus:border-[#7AAACE] transition"
              />
            </div>

            <button
              className="p-3 shrink-0 bg-white rounded-xl border border-[#E0E6E4] text-[#526273] hover:bg-[#EAF1F4] transition"
              title="Theme"
            >
              <Moon size={19} />
            </button>
          </div>
        </div>

        {/* Groups Page */}
        {isGroupsTab ? (
          <section className="space-y-6">
            <div className="bg-[#173D59] rounded-3xl p-6 md:p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-[#7AAACE] text-[#173D59]">
                  <Users size={28} />
                </div>

                <div>
                  <h2 className="text-xl md:text-2xl font-bold">
                    Course Groups
                  </h2>

                  <p className="text-sm text-[#D5E2E9] mt-1">
                    Create a group or join your classmates for group assignments.
                  </p>
                </div>
              </div>
            </div>

            {groupMessage && (
              <div className="bg-white border border-[#E0E6E4] rounded-xl p-4 text-sm text-[#173D59]">
                {groupMessage}
              </div>
            )}

            {studentCourses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E9E7] p-8 text-center">
                <BookOpen size={35} className="mx-auto text-[#7AAACE]" />

                <h3 className="font-bold text-[#173D59] mt-3">
                  No enrolled courses
                </h3>

                <p className="text-sm text-[#526273] mt-2">
                  You are not enrolled in any courses yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {studentCourses
                  .filter((course) =>
                    course.title
                      ?.toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map((course) => {
                    const myGroup = getCourseGroup(course.id);
                    const courseGroups = getCourseGroups(course.id);

                    return (
                      <div
                        key={course.id}
                        className="bg-white rounded-2xl border border-[#E5E9E7] p-5 md:p-6 hover:shadow-md transition duration-200"
                      >
                        <div className="flex items-start gap-3 mb-5">
                          <div className="p-3 bg-[#EAF1F4] text-[#397BA6] rounded-xl">
                            <BookOpen size={22} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-bold text-lg text-[#173D59]">
                              {course.title}
                            </h3>

                            <p className="text-sm text-[#526273] mt-1">
                              {courseGroups.length} groups available
                            </p>
                          </div>
                        </div>

                        {myGroup ? (
                          <div className="bg-[#F7F8F0] rounded-xl p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-xs text-[#526273]">
                                  YOUR GROUP
                                </p>

                                <h4 className="font-bold text-[#173D59] mt-1">
                                  {myGroup.name}
                                </h4>
                              </div>

                              <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                                Joined
                              </span>
                            </div>

                            <div className="mt-4 space-y-3">
                              <p className="text-xs font-bold text-[#526273] uppercase">
                                Group Members
                              </p>

                              {myGroup.members.map((memberId) => {
                                const member = getStudentDetails(memberId);
                                const isLeader =
                                  String(myGroup.leaderId) ===
                                  String(memberId);

                                return (
                                  <div
                                    key={memberId}
                                    className="flex items-center gap-3"
                                  >
                                    <div className="w-9 h-9 rounded-full bg-[#7AAACE] text-[#173D59] flex items-center justify-center text-xs font-bold">
                                      {member.initials ||
                                        member.name?.charAt(0)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-[#173D59]">
                                        {member.name}
                                        {String(memberId) ===
                                          String(currentUser.id) && (
                                          <span className="text-xs text-[#526273]">
                                            {" "}
                                            (You)
                                          </span>
                                        )}
                                      </p>
                                    </div>

                                    {isLeader && (
                                      <span className="flex items-center gap-1 text-xs font-semibold text-amber-700">
                                        <Crown size={14} />
                                        Leader
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="mb-5">
                              <p className="text-sm font-semibold text-[#173D59] mb-3">
                                Available Groups
                              </p>

                              {courseGroups.length === 0 ? (
                                <p className="text-sm text-[#526273] bg-[#F7F8F0] rounded-xl p-4">
                                  No groups have been created for this course yet.
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {courseGroups.map((group) => {
                                    const leader = getStudentDetails(
                                      group.leaderId
                                    );

                                    return (
                                      <div
                                        key={group.id}
                                        className="border border-[#E5E9E7] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                      >
                                        <div>
                                          <h4 className="font-semibold text-sm text-[#173D59]">
                                            {group.name}
                                          </h4>

                                          <p className="text-xs text-[#526273] mt-1">
                                            Leader: {leader.name}
                                          </p>

                                          <p className="text-xs text-[#526273] mt-1">
                                            {group.members.length} member(s)
                                          </p>
                                        </div>

                                        <button
                                          onClick={() =>
                                            handleJoinGroup(
                                              course.id,
                                              group.id
                                            )
                                          }
                                          className="flex items-center justify-center gap-2 bg-[#7AAACE] text-[#173D59] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#6699BD] transition"
                                        >
                                          <UserPlus size={16} />
                                          Join Group
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            <div className="border-t border-[#E5E9E7] pt-4">
                              <p className="text-sm font-semibold text-[#173D59] mb-3">
                                Create a New Group
                              </p>

                              <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                  type="text"
                                  placeholder="Enter group name"
                                  value={groupNames[course.id] || ""}
                                  onChange={(e) =>
                                    setGroupNames((previous) => ({
                                      ...previous,
                                      [course.id]: e.target.value,
                                    }))
                                  }
                                  className="flex-1 min-w-0 border border-[#E0E6E4] rounded-xl px-4 py-3 text-sm text-[#173D59] outline-none focus:border-[#7AAACE]"
                                />

                                <button
                                  onClick={() =>
                                    handleCreateGroup(course.id)
                                  }
                                  className="flex items-center justify-center gap-2 bg-[#173D59] text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#245475] transition"
                                >
                                  <Plus size={17} />
                                  Create Group
                                </button>
                              </div>

                              <p className="text-xs text-[#526273] mt-2">
                                You will automatically become the leader of the group you create.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}

                {studentCourses.filter((course) =>
                  course.title
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="xl:col-span-2 bg-white rounded-2xl border border-[#E5E9E7] p-10 text-center">
                    <Search size={32} className="mx-auto text-[#7AAACE]" />
                    <h3 className="font-bold text-[#173D59] mt-3">
                      No courses found
                    </h3>
                    <p className="text-sm text-[#526273] mt-2">
                      Try searching with a different course name.
                    </p>
                    <button
                      onClick={clearSearch}
                      className="mt-4 text-sm font-semibold text-[#397BA6] hover:underline"
                    >
                      Clear Search
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Welcome Card */}
            {activeTab === "Dashboard" && (
              <>
                <section className="w-full min-w-0 bg-[#173D59] rounded-3xl p-5 sm:p-7 md:p-9 text-white mb-7">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div>
                      <p className="text-sm text-[#C8DCE8]">
                        Welcome back,
                      </p>

                      <h2 className="text-2xl md:text-3xl font-bold mt-2">
                        {currentUser.name}!
                      </h2>

                      <p className="text-sm text-[#D5E2E9] mt-3 max-w-lg">
                        Keep track of your assignments, complete your tasks
                        and stay on top of your academic progress.
                      </p>
                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-[#7AAACE] text-[#173D59] flex items-center justify-center text-xl font-bold shrink-0">
                      {currentUser.initials}
                    </div>
                  </div>
                </section>

                {/* Statistics */}
                <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-7">
                  {[
                    {
                      title: "Total Assignments",
                      value: totalAssignments,
                      icon: ClipboardList,
                      color: "bg-[#EAF1F4] text-[#397BA6]",
                    },
                    {
                      title: "Completed",
                      value: completedCount,
                      icon: CheckCircle2,
                      color: "bg-[#E8F3EA] text-green-700",
                    },
                    {
                      title: "Pending",
                      value: pendingCount,
                      icon: Clock,
                      color: "bg-[#FFF3DC] text-amber-600",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="bg-white rounded-2xl p-5 border border-[#E5E9E7] hover:shadow-md transition duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-[#526273]">
                              {item.title}
                            </p>

                            <h3 className="text-3xl font-bold text-[#173D59] mt-2">
                              {item.value}
                            </h3>
                          </div>

                          <div className={`p-3 rounded-xl ${item.color}`}>
                            <Icon size={23} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </section>

                {/* Progress and Upcoming */}
                <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 md:gap-6 mb-7">
                  <div className="bg-white rounded-2xl p-6 border border-[#E5E9E7]">
                    <h3 className="text-lg font-bold text-[#173D59]">
                      Overall Progress
                    </h3>

                    <p className="text-sm text-[#526273] mt-1">
                      Your assignment completion
                    </p>

                    <div className="flex items-center justify-center py-6">
                      <div className="relative w-36 h-36">
                        <svg
                          className="w-full h-full -rotate-90"
                          viewBox="0 0 120 120"
                        >
                          <circle
                            cx="60"
                            cy="60"
                            r="48"
                            stroke="#EAF1F4"
                            strokeWidth="11"
                            fill="none"
                          />

                          <circle
                            cx="60"
                            cy="60"
                            r="48"
                            stroke="#7AAACE"
                            strokeWidth="11"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 48}`}
                            strokeDashoffset={`${
                              2 * Math.PI * 48 * (1 - progress / 100)
                            }`}
                          />
                        </svg>

                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-[#173D59]">
                            {progress}%
                          </span>

                          <span className="text-xs text-[#526273]">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-center text-sm text-[#526273]">
                      {completedCount} of {totalAssignments} assignments submitted
                    </p>
                  </div>

                  <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-[#E5E9E7]">
                    <div className="flex items-center justify-between gap-3 mb-5">
                      <div>
                        <h3 className="text-lg font-bold text-[#173D59]">
                          Coming Up
                        </h3>

                        <p className="text-sm text-[#526273] mt-1">
                          Your upcoming pending assignments
                        </p>
                      </div>

                      <CalendarDays
                        className="text-[#397BA6]"
                        size={22}
                      />
                    </div>

                    {upcomingAssignments.length === 0 ? (
                      <p className="text-sm text-[#526273] py-6 text-center">
                        No upcoming assignments. Great work!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingAssignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#F7F8F0]"
                          >
                            <div className="min-w-0">
                              <h4 className="font-semibold text-sm text-[#173D59]">
                                {assignment.title}
                              </h4>

                              <p className="text-xs text-[#526273] mt-1">
                                Due: {assignment.dueDate}
                                {assignment.dueTime &&
                                  ` at ${assignment.dueTime}`}
                              </p>
                            </div>

                            {isOverdue(assignment) ? (
                              <span className="text-xs font-semibold bg-red-50 text-red-700 px-3 py-1.5 rounded-full shrink-0">
                                Overdue
                              </span>
                            ) : (
                              <span className="text-xs font-semibold bg-[#FFF0D5] text-amber-700 px-3 py-1.5 rounded-full shrink-0">
                                Pending
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* Assignment List */}
            <section className="w-full min-w-0 bg-white rounded-2xl border border-[#E5E9E7] overflow-hidden">
              <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#173D59]">
                    {activeTab === "Dashboard"
                      ? "My Assignments"
                      : activeTab + " Assignments"}
                  </h3>

                  <p className="text-sm text-[#526273] mt-1">
                    Manage and track your assigned tasks
                  </p>
                </div>

                <span className="text-sm text-[#526273]">
                  {displayedAssignments.length} assignments
                </span>
              </div>

              {submissionMessage && (
                <div className="mx-5 mb-4 bg-[#EAF1F4] border border-[#D5E2E9] rounded-xl p-4 text-sm text-[#173D59]">
                  {submissionMessage}
                </div>
              )}

              <div className="w-full max-w-full overflow-x-auto">
                <table className="w-full min-w-170 text-left">
                  <thead className="bg-[#F7F8F0] text-[#526273] text-xs uppercase">
                    <tr>
                      <th className="px-5 py-4">Assignment</th>
                      <th className="px-5 py-4">Due Date</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E5E9E7]">
                    {displayedAssignments.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-5 py-12">
                          <div className="flex flex-col items-center text-center">
                            {totalAssignments === 0 ? (
                              <>
                                <div className="p-4 rounded-2xl bg-[#EAF1F4] text-[#397BA6]">
                                  <BookOpen size={30} />
                                </div>

                                <h3 className="font-bold text-[#173D59] mt-4">
                                  No assignments yet
                                </h3>

                                <p className="text-sm text-[#526273] mt-2 max-w-sm">
                                  You don't have any assignments assigned to you right now. Your professors' assignments will appear here.
                                </p>
                              </>
                            ) : searchQuery.trim() ? (
                              <>
                                <div className="p-4 rounded-2xl bg-[#EAF1F4] text-[#397BA6]">
                                  <Search size={30} />
                                </div>

                                <h3 className="font-bold text-[#173D59] mt-4">
                                  No matching assignments
                                </h3>

                                <p className="text-sm text-[#526273] mt-2">
                                  We couldn't find anything matching "{searchQuery}".
                                </p>

                                <button
                                  onClick={clearSearch}
                                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#397BA6] hover:underline"
                                >
                                  <X size={15} />
                                  Clear Search
                                </button>
                              </>
                            ) : (
                              <>
                                <div className="p-4 rounded-2xl bg-[#EAF1F4] text-[#397BA6]">
                                  <CheckCircle2 size={30} />
                                </div>

                                <h3 className="font-bold text-[#173D59] mt-4">
                                  {activeTab === "Completed"
                                    ? "No completed assignments"
                                    : activeTab === "Pending"
                                      ? "No pending assignments"
                                      : "No assignments found"}
                                </h3>

                                <p className="text-sm text-[#526273] mt-2">
                                  {activeTab === "Completed"
                                    ? "Your completed assignments will appear here."
                                    : activeTab === "Pending"
                                      ? "You're all caught up! You have no pending assignments."
                                      : "There are no assignments to display."}
                                </p>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      displayedAssignments.map((assignment) => {
                        const isGroupAssignment =
                          assignment.submissionType === "group";

                        const studentGroup = isGroupAssignment
                          ? getCourseGroup(assignment.courseId)
                          : null;

                        const groupSubmission =
                          studentGroup &&
                          getGroupSubmission(assignment, studentGroup);

                        const individualSubmission = !isGroupAssignment
                          ? getIndividualSubmission(assignment)
                          : null;

                        const isGroupLeader =
                          studentGroup &&
                          String(studentGroup.leaderId) ===
                            String(currentUser.id);

                        const isSubmitted =
                          isAssignmentCompleted(assignment);

                        const overdue =
                          isOverdue(assignment);

                        const leader = groupSubmission
                          ? getStudentDetails(groupSubmission.leaderId)
                          : null;

                        return (
                          <tr
                            key={assignment.id}
                            className="hover:bg-[#FAFBF8] transition duration-200"
                          >
                            <td className="px-5 py-4 min-w-55">
                              <p className="font-semibold text-sm text-[#173D59]">
                                {assignment.title}
                              </p>

                              <p className="text-xs text-[#526273] mt-1 max-w-xs">
                                {assignment.description}
                              </p>

                              <span className="inline-block mt-2 text-xs font-semibold text-[#397BA6] bg-[#EAF1F4] px-2.5 py-1 rounded-full">
                                {isGroupAssignment ? "Group" : "Individual"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm text-[#526273] whitespace-nowrap">
                              <span className={overdue ? "text-red-700 font-semibold" : ""}>
                                {assignment.dueDate}
                              </span>

                              {assignment.dueTime && (
                                <p className="text-xs mt-1">
                                  {assignment.dueTime}
                                </p>
                              )}

                              {overdue && (
                                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                                  <AlertTriangle size={13} />
                                  Overdue
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              {isSubmitted ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-full whitespace-nowrap">
                                    <CheckCircle2 size={14} />
                                    Acknowledged
                                  </span>

                                  {isGroupAssignment && groupSubmission && (
                                    <div className="text-xs text-[#526273] max-w-52">
                                      <p>By {leader?.name || "Group Leader"}</p>
                                      <p className="mt-1">
                                        on {new Date(groupSubmission.acknowledgedAt).toLocaleString()}
                                      </p>
                                    </div>
                                  )}

                                  {!isGroupAssignment && individualSubmission?.acknowledgedAt && (
                                    <p className="text-xs text-[#526273] max-w-52">
                                      Acknowledged on {new Date(individualSubmission.acknowledgedAt).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              ) : overdue ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 px-3 py-2 rounded-full whitespace-nowrap">
                                  <AlertTriangle size={14} />
                                  Overdue
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-2 rounded-full whitespace-nowrap">
                                  <Clock size={14} />
                                  Pending
                                </span>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-col items-start gap-2">
                                <a
                                  href={assignment.driveLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm font-semibold text-[#397BA6] hover:underline"
                                >
                                  Drive link
                                </a>

                                {!isGroupAssignment && !isSubmitted && (
                                  <button
                                    onClick={() =>
                                      handleSubmitClick(assignment)
                                    }
                                    className="text-xs font-semibold text-[#173D59] bg-[#7AAACE] px-3 py-2 rounded-lg hover:bg-[#6699BD] transition whitespace-nowrap"
                                  >
                                    Acknowledge Submission
                                  </button>
                                )}

                                {isGroupAssignment && !studentGroup && (
                                  <div className="max-w-64 space-y-2">
                                    <p className="text-xs text-[#526273]">
                                      You are not part of any group. Create or join one to submit this assignment.
                                    </p>

                                    <button
                                      onClick={handleGoToGroups}
                                      className="text-xs font-semibold text-[#173D59] bg-[#7AAACE] px-3 py-2 rounded-lg hover:bg-[#6699BD] transition"
                                    >
                                      Create or Join Group
                                    </button>
                                  </div>
                                )}

                                {isGroupAssignment &&
                                  studentGroup &&
                                  isGroupLeader &&
                                  !isSubmitted && (
                                    <button
                                      onClick={() =>
                                        handleSubmitClick(assignment)
                                      }
                                      className="text-xs font-semibold text-[#173D59] bg-[#7AAACE] px-3 py-2 rounded-lg hover:bg-[#6699BD] transition whitespace-nowrap"
                                    >
                                      Acknowledge for Group
                                    </button>
                                  )}

                                {isGroupAssignment &&
                                  studentGroup &&
                                  !isGroupLeader &&
                                  !isSubmitted && (
                                    <p className="text-xs text-[#526273] max-w-52">
                                      Waiting for your group leader to acknowledge this assignment.
                                    </p>
                                  )}

                                {isGroupAssignment &&
                                  groupSubmission && (
                                    <div className="max-w-64">
                                      <p className="text-xs font-semibold text-green-700">
                                        Acknowledged by {leader?.name || "Group Leader"}
                                      </p>

                                      <p className="text-xs text-[#526273] mt-1">
                                        on{" "}
                                        {new Date(
                                          groupSubmission.acknowledgedAt
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDialogOpen}
        step={dialogStep}
        assignment={selectedAssignment}
        onNext={handleNextStep}
        onConfirm={handleConfirmSubmission}
        onCancel={handleCancelSubmission}
      />
    </div>
  );
}

export default StudentDashboard;
