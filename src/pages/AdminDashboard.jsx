
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ClipboardList,
  Search,
  Moon,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Eye,
  BookOpen,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import AssignmentForm from "../components/AssignmentForm";
import StudentSubmissionList from "../components/StudentSubmissionList";
import AssignmentDetails from "../components/AssignmentDetails";

import { useAppContext } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import { students } from "../data/accounts";

function AdminDashboard() {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const isCoursePage = Boolean(courseId);

  const {
    currentUser,
    setCurrentUser,
    assignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    courses,
    groups,
  } = useAppContext();

  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [searchTerm, setSearchTerm] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [detailsAssignment, setDetailsAssignment] = useState(null);

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  // Find the selected course and verify its professor.
  const selectedCourse = isCoursePage
    ? courses.find(
        (course) =>
          String(course.id) === String(courseId) &&
          String(course.createdBy) === String(currentUser.id)
      )
    : null;

  if (isCoursePage && !selectedCourse) {
    return (
      <div className="min-h-screen bg-[#F7F8F0] flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#173D59]">
            Course not found
          </h2>

          <button
            onClick={() => navigate("/admin")}
            className="mt-4 bg-[#7AAACE] text-[#173D59] px-5 py-2 rounded-xl font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Only show courses created by the logged-in professor.
  const adminCourses = courses.filter(
    (course) => String(course.createdBy) === String(currentUser.id)
  );

  // Search courses.
  const filteredCourses = adminCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Only show assignments created by the logged-in professor.
  const adminAssignments = assignments.filter(
    (assignment) =>
      String(assignment.createdBy) === String(currentUser.id)
  );

  // Assignments belonging to the selected course.
  const courseAssignments = isCoursePage
    ? adminAssignments.filter(
        (assignment) =>
          String(assignment.courseId) === String(courseId)
      )
    : adminAssignments;

  const displayedAssignments = isCoursePage
    ? courseAssignments
    : adminAssignments;

  // Check whether a student is assigned to an assignment.
  const isStudentAssigned = (assignment, studentId) => {
    if (assignment.assignedTo === "all") return true;

    return assignment.assignedTo?.some(
      (id) => String(id) === String(studentId)
    );
  };

  // Get students assigned to an individual assignment.
  const getAssignedStudents = (assignment) => {
    return students.filter((student) =>
      isStudentAssigned(assignment, student.id)
    );
  };

  // Get groups belonging to a group assignment's course.
  const getAssignedGroups = (assignment) => {
    if (!assignment.courseId) return [];

    return groups.filter((group) => {
      const belongsToCourse =
        String(group.courseId) === String(assignment.courseId);

      const hasAssignedMember = group.members.some((memberId) =>
        isStudentAssigned(assignment, memberId)
      );

      return belongsToCourse && hasAssignedMember;
    });
  };

  // Check whether a group has acknowledged an assignment.
  const isGroupSubmitted = (assignment, groupId) => {
    return (
      assignment.groupSubmissions?.some(
        (submission) =>
          String(submission.groupId) === String(groupId)
      ) || false
    );
  };

  // Calculate assignment statistics.
  // Individual assignments count students.
  // Group assignments count groups.
  const getAssignmentStats = (assignment) => {
    const isGroupAssignment =
      assignment.submissionType === "group";

    let total = 0;
    let submitted = 0;

    if (isGroupAssignment) {
      const assignedGroups = getAssignedGroups(assignment);

      total = assignedGroups.length;

      submitted = assignedGroups.filter((group) =>
        isGroupSubmitted(assignment, group.id)
      ).length;
    } else {
      const assignedStudents = getAssignedStudents(assignment);

      total = assignedStudents.length;

      submitted = assignedStudents.filter((student) =>
        assignment.submittedBy?.some(
          (id) => String(id) === String(student.id)
        )
      ).length;
    }

    const pending = total - submitted;

    const today = new Date().toISOString().split("T")[0];
    const isPastDue = assignment.dueDate < today;

    return {
      total,
      submitted,
      pending,
      isPastDue,
      isGroupAssignment,
      progress:
        total === 0 ? 0 : Math.round((submitted / total) * 100),
    };
  };

  // Overall statistics.
  const totalExpected = adminAssignments.reduce(
    (sum, assignment) =>
      sum + getAssignmentStats(assignment).total,
    0
  );

  const totalSubmitted = adminAssignments.reduce(
    (sum, assignment) =>
      sum + getAssignmentStats(assignment).submitted,
    0
  );

  const totalMissing = adminAssignments.reduce((sum, assignment) => {
    const stats = getAssignmentStats(assignment);
    return stats.isPastDue ? sum + stats.pending : sum;
  }, 0);

  const totalPending = totalExpected - totalSubmitted;

  const completionRate =
    totalExpected === 0
      ? 0
      : Math.round((totalSubmitted / totalExpected) * 100);

  // Sidebar counts.
  const sidebarCounts = {
    total: adminAssignments.length,

    completed: adminAssignments.filter((assignment) => {
      const stats = getAssignmentStats(assignment);
      return stats.total > 0 && stats.pending === 0;
    }).length,

    pending: adminAssignments.filter((assignment) => {
      const stats = getAssignmentStats(assignment);
      return stats.isPastDue && stats.pending > 0;
    }).length,
  };

  // Create assignment.
  const handleCreateClick = () => {
    setEditingAssignment(null);
    setIsFormOpen(true);
  };

  // Edit assignment.
  const handleEditClick = (assignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  // Save assignment.
  const handleSaveAssignment = (assignmentData) => {
    const updatedData = selectedCourse
      ? {
          ...assignmentData,
          courseId: selectedCourse.id,
        }
      : assignmentData;

    if (editingAssignment) {
      updateAssignment(editingAssignment.id, updatedData);

      showToast("Assignment updated successfully.", "success");
    } else {
      createAssignment({
        ...updatedData,
        createdBy: currentUser.id,
      });

      showToast("Assignment created successfully.", "success");
    }

    setIsFormOpen(false);
    setEditingAssignment(null);
  };

  // Close assignment form.
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAssignment(null);
  };

  // Delete assignment.
  const handleDeleteAssignment = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (confirmed) {
      deleteAssignment(id);

      showToast("Assignment deleted successfully.", "success");

      if (detailsAssignment?.id === id) {
        setDetailsAssignment(null);
      }

      if (selectedAssignment?.id === id) {
        setSelectedAssignment(null);
        setIsSubmissionOpen(false);
      }
    }
  };

  // View submissions.
  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionOpen(true);
  };

  // Logout.
  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  // Filter assignments.
  const filteredAssignments = displayedAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const stats = getAssignmentStats(assignment);

    let matchesTab = true;

    if (!isCoursePage && activeTab === "Completed") {
      matchesTab = stats.total > 0 && stats.pending === 0;
    } else if (!isCoursePage && activeTab === "Past due") {
      matchesTab = stats.isPastDue && stats.pending > 0;
    }

    return matchesSearch && matchesTab;
  });

  // Find missing individual students and pending groups.
  const missingWork = adminAssignments.flatMap((assignment) => {
    const stats = getAssignmentStats(assignment);

    if (!stats.isPastDue) return [];

    if (stats.isGroupAssignment) {
      return getAssignedGroups(assignment)
        .filter(
          (group) => !isGroupSubmitted(assignment, group.id)
        )
        .map((group) => ({
          type: "group",
          group,
          assignment,
        }));
    }

    return getAssignedStudents(assignment)
      .filter(
        (student) =>
          !assignment.submittedBy?.some(
            (id) => String(id) === String(student.id)
          )
      )
      .map((student) => ({
        type: "student",
        student,
        assignment,
      }));
  });

  return (
    <div className="min-h-screen bg-[#F7F8F0] flex">
      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={isCoursePage ? "Courses" : activeTab}
        onTabChange={(tab) => {
          setSearchTerm("");

          if (isCoursePage) {
            navigate("/admin");
          }

          setActiveTab(tab);
        }}
        onLogout={handleLogout}
        counts={sidebarCounts}
      />

      <main className="flex-1 min-w-0 w-full p-5 pt-20 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-[#173D59] wrap-break-words">
              {isCoursePage ? selectedCourse.title : activeTab}
            </h1>

            <p className="text-sm text-[#526273] mt-1">
              {isCoursePage
                ? selectedCourse.description
                : activeTab === "Courses"
                ? "Manage your courses and enrolled students."
                : "Manage assignments and track student progress."}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto min-w-0">
            <div className="relative flex-1 min-w-0 md:flex-none md:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526273]"
              />

              <input
                type="text"
                placeholder={
                  activeTab === "Courses" && !isCoursePage
                    ? "Search courses..."
                    : "Search assignments..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E1E6E3] bg-white text-sm outline-none focus:ring-2 focus:ring-[#7AAACE]"
              />
            </div>

            <button
              className="p-3 shrink-0 rounded-xl bg-white border border-[#E1E6E3] text-[#526273]"
              title="Appearance"
            >
              <Moon size={19} />
            </button>

            <div className="w-10 h-10 shrink-0 rounded-full bg-[#7AAACE] text-[#173D59] font-bold flex items-center justify-center">
              {currentUser.initials}
            </div>
          </div>
        </div>

        {/* Course Page Information */}
        {isCoursePage && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm text-[#526273]">
                {selectedCourse.enrolledStudents.length} enrolled students
              </p>

              <p className="text-sm text-[#526273] mt-1">
                Manage assignments for this course.
              </p>
            </div>

            <button
              onClick={() => navigate("/admin")}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#E5E9E7] text-[#173D59] font-semibold text-sm hover:bg-[#EAF1F4] transition"
            >
              Back to Courses
            </button>
          </div>
        )}

        {/* Dashboard Overview */}
        {!isCoursePage && activeTab === "Dashboard" && (
          <>
            {/* Welcome Banner */}
            <div className="bg-[#173D59] rounded-3xl p-6 md:p-8 text-white mb-8 flex flex-col md:flex-row justify-between gap-6">
              <div>
                <p className="text-sm text-[#C6DCEB] mb-2">
                  ADMIN DASHBOARD
                </p>

                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Welcome back,{" "}
                  {currentUser.name.split(" ")[1] || currentUser.name}!
                </h2>

                <p className="text-sm text-[#D5E3EC] max-w-lg">
                  Keep track of assignments, monitor student submissions,
                  and manage your classroom work.
                </p>

                <button
                  onClick={handleCreateClick}
                  className="mt-6 bg-[#7AAACE] text-[#173D59] px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#A4C7E0] transition flex items-center gap-2"
                >
                  <Plus size={18} />
                  New Assignment
                </button>
              </div>

              <div className="bg-white/10 rounded-2xl p-5 min-w-45 self-start md:self-center">
                <div className="flex items-center gap-2 text-[#D5E3EC] text-sm mb-3">
                  <Users size={18} />
                  Class overview
                </div>

                <p className="text-4xl font-bold">{students.length}</p>

                <p className="text-sm text-[#D5E3EC] mt-1">
                  Total students
                </p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              <StatCard
                title="Total Assignments"
                value={adminAssignments.length}
                icon={ClipboardList}
              />

              <StatCard
                title="Submitted"
                value={totalSubmitted}
                icon={CheckCircle2}
              />

              <StatCard
                title="Pending"
                value={totalPending}
                icon={Clock}
              />

              <StatCard
                title="Missing Work"
                value={totalMissing}
                icon={AlertTriangle}
              />
            </div>

            {/* Overall Progress */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E9E7] mb-8">
              <div className="flex flex-col sm:flex-row justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-[#173D59]">
                    Overall Class Progress
                  </h3>

                  <p className="text-sm text-[#526273] mt-1">
                    Submission progress across your assignments
                  </p>
                </div>

                <p className="text-2xl font-bold text-[#173D59]">
                  {completionRate}%
                </p>
              </div>

              <div className="w-full h-3 bg-[#EAF0F2] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#7AAACE] rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>

              <div className="flex justify-between text-sm text-[#526273] mt-3">
                <span>{totalSubmitted} acknowledged</span>
                <span>{totalPending} pending</span>
              </div>
            </div>
          </>
        )}

        {/* Courses Section */}
        {!isCoursePage && activeTab === "Courses" && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#173D59]">
                  My Courses
                </h2>

                <p className="text-sm text-[#526273] mt-1">
                  Manage your courses and enrolled students.
                </p>
              </div>

              <div className="bg-white border border-[#E5E9E7] rounded-xl px-4 py-2.5 text-sm text-[#526273]">
                {adminCourses.length} Courses
              </div>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E5E9E7] py-14 text-center">
                <BookOpen
                  size={38}
                  className="mx-auto text-[#9BAAB3] mb-3"
                />

                <p className="font-semibold text-[#173D59]">
                  No courses found
                </p>

                <p className="text-sm text-[#526273] mt-1">
                  Try another search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredCourses.map((course) => {
                  const enrolledCount = course.enrolledStudents.length;

                  return (
                    <button
                      key={course.id}
                      onClick={() =>
                        navigate(`/admin/courses/${course.id}`)
                      }
                      className="w-full text-left bg-white rounded-2xl border border-[#E5E9E7] p-6 hover:shadow-md hover:border-[#7AAACE] transition duration-200"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-xl bg-[#EAF1F4] flex items-center justify-center text-[#397BA6]">
                          <BookOpen size={24} />
                        </div>

                        <span className="text-xs font-semibold bg-[#EAF1F4] text-[#397BA6] px-3 py-1.5 rounded-full">
                          Active Course
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#173D59] mb-2">
                        {course.title}
                      </h3>

                      <p className="text-sm text-[#526273] leading-relaxed min-h-12">
                        {course.description}
                      </p>

                      <div className="border-t border-[#E5E9E7] mt-5 pt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-[#526273]">
                          <Users size={17} />

                          <span>
                            {enrolledCount} Enrolled Students
                          </span>
                        </div>

                        <span className="text-xs font-semibold text-[#397BA6]">
                          Course #{course.id}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Assignments Table */}
        {(isCoursePage || activeTab !== "Courses") && (
          <div className="bg-white rounded-2xl border border-[#E5E9E7] overflow-hidden">
            <div className="p-5 md:p-6 flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#173D59]">
                  {isCoursePage
                    ? "Course Assignments"
                    : activeTab === "Dashboard"
                    ? "Your Assignments"
                    : activeTab}
                </h3>

                <p className="text-sm text-[#526273] mt-1">
                  {isCoursePage
                    ? "View and manage assignments for this course."
                    : "View and manage your assignments."}
                </p>
              </div>

              <button
                onClick={handleCreateClick}
                className="bg-[#7AAACE] text-[#173D59] px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#A4C7E0] transition flex items-center justify-center gap-2"
              >
                <Plus size={17} />
                Add Assignment
              </button>
            </div>

            {filteredAssignments.length === 0 ? (
              <div className="py-14 text-center">
                <ClipboardList
                  size={38}
                  className="mx-auto text-[#9BAAB3] mb-3"
                />

                <p className="font-semibold text-[#173D59]">
                  No assignments found
                </p>

                <p className="text-sm text-[#526273] mt-1">
                  {isCoursePage
                    ? "Create the first assignment for this course."
                    : "Create an assignment or try another search."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-212.5">
                  <thead className="bg-[#F7F8F0] text-[#526273] text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4">Assignment</th>
                      <th className="px-6 py-4">Assigned To</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4">Progress</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#E5E9E7]">
                    {filteredAssignments.map((assignment) => {
                      const stats = getAssignmentStats(assignment);

                      return (
                        <tr
                          key={assignment.id}
                          className="hover:bg-[#FAFBF8] transition"
                        >
                          <td className="px-6 py-5">
                            <button
                              onClick={() =>
                                setDetailsAssignment(assignment)
                              }
                              className="font-semibold text-[#173D59] hover:text-[#397BA6] hover:underline text-left transition"
                            >
                              {assignment.title}
                            </button>

                            <p className="text-xs text-[#526273] mt-1 max-w-xs truncate">
                              {assignment.description}
                            </p>

                            <span className="inline-block mt-2 text-[10px] font-semibold bg-[#EAF1F4] text-[#397BA6] px-2 py-1 rounded-full">
                              {stats.isGroupAssignment
                                ? "Group"
                                : "Individual"}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm text-[#526273]">
                            {stats.isGroupAssignment
                              ? `${stats.total} Groups`
                              : assignment.assignedTo === "all"
                              ? "All Students"
                              : `${stats.total} Students`}
                          </td>

                          <td className="px-6 py-5 text-sm text-[#526273]">
                            {assignment.dueDate}
                            {assignment.dueTime && (
                              <p className="text-xs text-[#526273] mt-1">
                                {assignment.dueTime}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-[#EAF0F2] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#7AAACE] rounded-full"
                                  style={{
                                    width: `${stats.progress}%`,
                                  }}
                                />
                              </div>

                              <span className="text-xs font-semibold text-[#173D59]">
                                {stats.progress}%
                              </span>
                            </div>

                            <p className="text-xs text-[#526273] mt-1">
                              {stats.submitted}/{stats.total}{" "}
                              {stats.isGroupAssignment
                                ? "groups acknowledged"
                                : "students submitted"}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            {stats.pending === 0 && stats.total > 0 ? (
                              <span className="text-xs font-semibold bg-[#E5F4EA] text-[#287343] px-3 py-1.5 rounded-full">
                                Completed
                              </span>
                            ) : stats.isPastDue ? (
                              <span className="text-xs font-semibold bg-[#FCE9E7] text-[#B5473B] px-3 py-1.5 rounded-full">
                                Past Due
                              </span>
                            ) : (
                              <span className="text-xs font-semibold bg-[#FFF3D9] text-[#956B16] px-3 py-1.5 rounded-full">
                                In Progress
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  handleViewSubmissions(assignment)
                                }
                                className="text-[#526273] hover:text-[#397BA6]"
                                title={
                                  stats.isGroupAssignment
                                    ? "View group acknowledgements"
                                    : "View student submissions"
                                }
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                onClick={() =>
                                  handleEditClick(assignment)
                                }
                                className="text-[#526273] hover:text-[#397BA6]"
                                title="Edit assignment"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteAssignment(assignment.id)
                                }
                                className="text-[#526273] hover:text-red-600"
                                title="Delete assignment"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Missing Submissions */}
        {!isCoursePage && activeTab === "Dashboard" && (
          <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 mt-8">
            <h3 className="text-lg font-bold text-[#173D59] mb-1">
              Missing Submissions
            </h3>

            <p className="text-sm text-[#526273] mb-5">
              Students and groups who have not acknowledged past-due assignments.
            </p>

            {missingWork.length === 0 ? (
              <p className="text-sm text-[#526273] py-4">
                No missing submissions. Great work!
              </p>
            ) : (
              <div className="space-y-3">
                {missingWork.map((item) => (
                  <div
                    key={
                      item.type === "group"
                        ? `${item.assignment.id}-${item.group.id}`
                        : `${item.assignment.id}-${item.student.id}`
                    }
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F8F0]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-[#7AAACE] text-[#173D59] flex items-center justify-center font-bold text-sm">
                        {item.type === "group"
                          ? item.group.name.slice(0, 2).toUpperCase()
                          : item.student.initials}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#173D59] wrap-break-words">
                          {item.type === "group"
                            ? item.group.name
                            : item.student.name}
                        </p>

                        <p className="text-xs text-[#526273] wrap-break-words">
                          {item.assignment.title}
                        </p>

                        {item.type === "group" && (
                          <p className="text-xs text-[#526273] mt-1">
                            Leader:{" "}
                            {
                              students.find(
                                (student) =>
                                  String(student.id) ===
                                  String(item.group.leaderId)
                              )?.name || "Unknown Student"
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-[#B5473B] bg-[#FCE9E7] px-3 py-1.5 rounded-full self-start sm:self-center shrink-0">
                      {item.type === "group"
                        ? "Group Pending"
                        : "Not Submitted"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create / Edit Assignment Modal */}
      <AssignmentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveAssignment}
        editingAssignment={editingAssignment}
        course={selectedCourse}
      />

      {/* Student / Group Submission Modal */}
      <StudentSubmissionList
        assignment={isSubmissionOpen ? selectedAssignment : null}
        onClose={() => {
          setIsSubmissionOpen(false);
          setSelectedAssignment(null);
        }}
      />

      {/* Complete Assignment Details Modal */}
      <AssignmentDetails
        assignment={detailsAssignment}
        onClose={() => setDetailsAssignment(null)}
      />
    </div>
  );
}

// Statistics Card
function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E9E7]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#526273]">{title}</p>

        <div className="p-2.5 bg-[#EAF1F4] rounded-xl text-[#397BA6]">
          <Icon size={20} />
        </div>
      </div>

      <p className="text-3xl font-bold text-[#173D59]">{value}</p>
    </div>
  );
}

export default AdminDashboard;
