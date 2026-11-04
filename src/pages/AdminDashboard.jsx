
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import AssignmentForm from "../components/AssignmentForm";
import StudentSubmissionList from "../components/StudentSubmissionList";
import AssignmentDetails from "../components/AssignmentDetails";

import { useAppContext } from "../context/AppContext";
import { students } from "../data/accounts";

function AdminDashboard() {
  const navigate = useNavigate();

  const {
    currentUser,
    setCurrentUser,
    assignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
  } = useAppContext();

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

  // Only show assignments created by the logged-in admin
  const adminAssignments = assignments.filter(
    (assignment) => assignment.createdBy === currentUser.id
  );

  // Get students assigned to an assignment
  const getAssignedStudents = (assignment) => {
    if (assignment.assignedTo === "all") {
      return students;
    }

    return students.filter((student) =>
      assignment.assignedTo?.includes(student.id)
    );
  };

  // Calculate assignment statistics
  const getAssignmentStats = (assignment) => {
    const assignedStudents = getAssignedStudents(assignment);

    const submitted = assignedStudents.filter((student) =>
      assignment.submittedBy?.includes(student.id)
    ).length;

    const total = assignedStudents.length;
    const pending = total - submitted;

    const today = new Date().toISOString().split("T")[0];
    const isPastDue = assignment.dueDate < today;

    return {
      total,
      submitted,
      pending,
      isPastDue,
      progress:
        total === 0 ? 0 : Math.round((submitted / total) * 100),
    };
  };

  // Overall statistics
  const totalExpected = adminAssignments.reduce(
    (sum, assignment) => sum + getAssignmentStats(assignment).total,
    0
  );

  const totalSubmitted = adminAssignments.reduce(
    (sum, assignment) => sum + getAssignmentStats(assignment).submitted,
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

  // Sidebar counts
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

  // Create assignment
  const handleCreateClick = () => {
    setEditingAssignment(null);
    setIsFormOpen(true);
  };

  // Edit assignment
  const handleEditClick = (assignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  // Save assignment
  const handleSaveAssignment = (assignmentData) => {
    if (editingAssignment) {
      updateAssignment(editingAssignment.id, assignmentData);
    } else {
      createAssignment({
        ...assignmentData,
        createdBy: currentUser.id,
      });
    }

    setIsFormOpen(false);
    setEditingAssignment(null);
  };

  // Close assignment form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAssignment(null);
  };

  // Delete assignment
  const handleDeleteAssignment = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (confirmed) {
      deleteAssignment(id);

      if (detailsAssignment?.id === id) {
        setDetailsAssignment(null);
      }

      if (selectedAssignment?.id === id) {
        setSelectedAssignment(null);
        setIsSubmissionOpen(false);
      }
    }
  };

  // View student submissions
  const handleViewSubmissions = (assignment) => {
    setSelectedAssignment(assignment);
    setIsSubmissionOpen(true);
  };

  // Logout
  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  // Filter assignments
  const filteredAssignments = adminAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const stats = getAssignmentStats(assignment);

    let matchesTab = true;

    if (activeTab === "Completed") {
      matchesTab = stats.total > 0 && stats.pending === 0;
    } else if (activeTab === "Past due") {
      matchesTab = stats.isPastDue && stats.pending > 0;
    }

    return matchesSearch && matchesTab;
  });

  // Missing past-due submissions
  const missingWork = adminAssignments.flatMap((assignment) => {
    const stats = getAssignmentStats(assignment);

    if (!stats.isPastDue) return [];

    return getAssignedStudents(assignment)
      .filter(
        (student) => !assignment.submittedBy?.includes(student.id)
      )
      .map((student) => ({
        student,
        assignment,
      }));
  });

  return (
    <div className="min-h-screen bg-[#F7F8F0] flex">

      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        counts={sidebarCounts}
      />

      <main className="flex-1 min-w-0 w-full p-5 pt-20 md:p-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#173D59]">
              {activeTab}
            </h1>

            <p className="text-sm text-[#526273] mt-1">
              Manage assignments and track student progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526273]"
              />

              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E1E6E3] bg-white text-sm outline-none focus:ring-2 focus:ring-[#7AAACE]"
              />
            </div>

            <button
              className="p-3 rounded-xl bg-white border border-[#E1E6E3] text-[#526273]"
              title="Appearance"
            >
              <Moon size={19} />
            </button>

            <div className="w-10 h-10 rounded-full bg-[#7AAACE] text-[#173D59] font-bold flex items-center justify-center">
              {currentUser.initials}
            </div>
          </div>
        </div>

        {/* Dashboard Overview */}
        {activeTab === "Dashboard" && (
          <>
            {/* Welcome Banner */}
            <div className="bg-[#173D59] rounded-3xl p-6 md:p-8 text-white mb-8 flex flex-col md:flex-row justify-between gap-6">
              <div>
                <p className="text-sm text-[#C6DCEB] mb-2">
                  ADMIN DASHBOARD
                </p>

                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Welcome back, {currentUser.name.split(" ")[1] || currentUser.name}!
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
                <span>{totalSubmitted} submitted</span>
                <span>{totalPending} pending</span>
              </div>
            </div>
          </>
        )}

        {/* Assignments Table */}
        <div className="bg-white rounded-2xl border border-[#E5E9E7] overflow-hidden">
          <div className="p-5 md:p-6 flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-[#173D59]">
                {activeTab === "Dashboard" ? "Your Assignments" : activeTab}
              </h3>

              <p className="text-sm text-[#526273] mt-1">
                View and manage your assignments.
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
                Create an assignment or try another search.
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
                          {/* Clickable Assignment Title */}
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
                        </td>

                        <td className="px-6 py-5 text-sm text-[#526273]">
                          {assignment.assignedTo === "all"
                            ? "All Students"
                            : `${stats.total} Students`}
                        </td>

                        <td className="px-6 py-5 text-sm text-[#526273]">
                          {assignment.dueDate}
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
                            {stats.submitted}/{stats.total} submitted
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
                            {/* View Submissions */}
                            <button
                              onClick={() =>
                                handleViewSubmissions(assignment)
                              }
                              className="text-[#526273] hover:text-[#397BA6]"
                              title="View student submissions"
                            >
                              <Eye size={17} />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() =>
                                handleEditClick(assignment)
                              }
                              className="text-[#526273] hover:text-[#397BA6]"
                              title="Edit assignment"
                            >
                              <Pencil size={17} />
                            </button>

                            {/* Delete */}
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

        {/* Missing Submissions */}
        {activeTab === "Dashboard" && (
          <div className="bg-white rounded-2xl border border-[#E5E9E7] p-6 mt-8">
            <h3 className="text-lg font-bold text-[#173D59] mb-1">
              Missing Submissions
            </h3>

            <p className="text-sm text-[#526273] mb-5">
              Students who have not submitted past-due assignments.
            </p>

            {missingWork.length === 0 ? (
              <p className="text-sm text-[#526273] py-4">
                No missing submissions. Great work!
              </p>
            ) : (
              <div className="space-y-3">
                {missingWork.map(({ student, assignment }) => (
                  <div
                    key={`${assignment.id}-${student.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F8F0]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#7AAACE] text-[#173D59] flex items-center justify-center font-bold text-sm">
                        {student.initials}
                      </div>

                      <div>
                        <p className="font-semibold text-sm text-[#173D59]">
                          {student.name}
                        </p>

                        <p className="text-xs text-[#526273]">
                          {assignment.title}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-semibold text-[#B5473B] bg-[#FCE9E7] px-3 py-1.5 rounded-full self-start sm:self-center">
                      Not Submitted
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
      />

      {/* Student Submission Modal */}
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
