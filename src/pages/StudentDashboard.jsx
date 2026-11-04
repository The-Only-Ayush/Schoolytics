
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Search,
  Moon,
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardList,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAppContext } from "../context/AppContext";

function StudentDashboard() {
  const navigate = useNavigate();

  const {
    currentUser,
    assignments,
    setCurrentUser,
    submitAssignment,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Submission dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState(1);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Protect the student dashboard
  if (!currentUser || currentUser.role !== "student") {
    return null;
  }

  // Get assignments assigned to the current student
  const studentAssignments = assignments.filter((assignment) => {
    return (
      assignment.assignedTo === "all" ||
      (Array.isArray(assignment.assignedTo) &&
        assignment.assignedTo.includes(currentUser.id))
    );
  });

  // Calculate submitted and pending assignments
  const completedAssignments = studentAssignments.filter((assignment) =>
    assignment.submittedBy?.includes(currentUser.id)
  );

  const pendingAssignments = studentAssignments.filter(
    (assignment) => !assignment.submittedBy?.includes(currentUser.id)
  );

  const totalAssignments = studentAssignments.length;
  const completedCount = completedAssignments.length;
  const pendingCount = pendingAssignments.length;

  const progress =
    totalAssignments === 0
      ? 0
      : Math.round((completedCount / totalAssignments) * 100);

  // Filter assignments according to the selected sidebar tab
  let displayedAssignments = studentAssignments;

  if (activeTab === "Completed") {
    displayedAssignments = completedAssignments;
  } else if (activeTab === "Pending") {
    displayedAssignments = pendingAssignments;
  }

  // Search assignments by title or description
  displayedAssignments = displayedAssignments.filter((assignment) => {
    const query = searchQuery.toLowerCase();

    return (
      assignment.title.toLowerCase().includes(query) ||
      assignment.description.toLowerCase().includes(query)
    );
  });

  // Logout
  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/");
  };

  // Open first confirmation dialog
  const handleSubmitClick = (assignment) => {
    setSelectedAssignment(assignment);
    setDialogStep(1);
    setIsDialogOpen(true);
  };

  // Move to final confirmation
  const handleNextStep = () => {
    setDialogStep(2);
  };

  // Confirm assignment submission
  const handleConfirmSubmission = () => {
    if (!selectedAssignment) return;

    submitAssignment(selectedAssignment.id, currentUser.id);

    setIsDialogOpen(false);
    setSelectedAssignment(null);
    setDialogStep(1);
  };

  // Cancel submission
  const handleCancelSubmission = () => {
    setIsDialogOpen(false);
    setSelectedAssignment(null);
    setDialogStep(1);
  };

  // Upcoming assignments (earliest due dates first)
  const upcomingAssignments = [...pendingAssignments]
    .sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
    )
    .slice(0, 3);

  return (
    <div className="min-h-screen w-full max-w-full bg-[#F7F8F0] flex overflow-x-hidden">

      {/* Sidebar */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        counts={{
          total: totalAssignments,
          completed: completedCount,
          pending: pendingCount,
        }}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0 w-full max-w-full p-5 pt-20 md:p-8 overflow-x-hidden">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 min-w-0">
          <div className="min-w-0">
            <p className="text-sm text-[#526273]">
              Student Dashboard
            </p>

            <h1 className="text-2xl md:text-3xl font-bold text-[#173D59] mt-1 wrap-break-words">
              {activeTab === "Dashboard"
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
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 pl-10 pr-4 py-3 rounded-xl bg-white border border-[#E0E6E4] text-sm text-[#173D59] outline-none focus:border-[#7AAACE]"
              />
            </div>

            <button
              className="p-3 shrink-0 bg-white rounded-xl border border-[#E0E6E4] text-[#526273] hover:bg-[#EAF1F4]"
              title="Theme"
            >
              <Moon size={19} />
            </button>
          </div>
        </div>

        {/* Welcome Card */}
        <section className="w-full min-w-0 bg-[#173D59] rounded-3xl p-5 sm:p-7 md:p-9 text-white mb-7 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between gap-6 min-w-0">

            <div className="min-w-0 w-full">
              <p className="text-sm text-[#C8DCE8]">
                Welcome back,
              </p>

              <h2 className="text-2xl md:text-3xl font-bold mt-2 wrap-break-words">
                {currentUser.name}!
              </h2>

              <p className="text-sm text-[#D5E2E9] mt-3 max-w-lg wrap-break-words">
                Keep track of your assignments, complete your tasks
                and stay on top of your academic progress.
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-[#7AAACE] text-[#173D59] flex items-center justify-center text-xl font-bold shrink-0">
              {currentUser.initials}
            </div>

          </div>
        </section>

        {/* Statistics Cards */}
        <section className="w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 mb-7">

          {/* Total Assignments */}
          <div className="min-w-0 bg-white rounded-2xl p-5 border border-[#E5E9E7]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-[#526273]">
                  Total Assignments
                </p>

                <h3 className="text-3xl font-bold text-[#173D59] mt-2">
                  {totalAssignments}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-[#EAF1F4] text-[#397BA6] shrink-0">
                <ClipboardList size={23} />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="min-w-0 bg-white rounded-2xl p-5 border border-[#E5E9E7]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-[#526273]">
                  Completed
                </p>

                <h3 className="text-3xl font-bold text-[#173D59] mt-2">
                  {completedCount}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-[#E8F3EA] text-green-700 shrink-0">
                <CheckCircle2 size={23} />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="min-w-0 bg-white rounded-2xl p-5 border border-[#E5E9E7]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-[#526273]">
                  Pending
                </p>

                <h3 className="text-3xl font-bold text-[#173D59] mt-2">
                  {pendingCount}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF3DC] text-amber-600 shrink-0">
                <Clock size={23} />
              </div>
            </div>
          </div>

        </section>

        {/* Progress and Upcoming */}
        <section className="w-full min-w-0 grid grid-cols-1 xl:grid-cols-3 gap-5 md:gap-6 mb-7">

          {/* Progress Card */}
          <div className="min-w-0 bg-white rounded-2xl p-6 border border-[#E5E9E7]">
            <h3 className="text-lg font-bold text-[#173D59]">
              Overall Progress
            </h3>

            <p className="text-sm text-[#526273] mt-1">
              Your assignment completion
            </p>

            <div className="flex items-center justify-center py-6">
              <div className="relative w-36 h-36 shrink-0">
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

          {/* Upcoming Assignments */}
          <div className="min-w-0 xl:col-span-2 bg-white rounded-2xl p-6 border border-[#E5E9E7]">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-[#173D59]">
                  Coming Up
                </h3>

                <p className="text-sm text-[#526273] mt-1">
                  Your upcoming pending assignments
                </p>
              </div>

              <CalendarDays className="text-[#397BA6] shrink-0" size={22} />
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
                    className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#F7F8F0] min-w-0"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-[#173D59] wrap-break-words">
                        {assignment.title}
                      </h4>

                      <p className="text-xs text-[#526273] mt-1">
                        Due: {assignment.dueDate}
                      </p>
                    </div>

                    <span className="text-xs font-semibold bg-[#FFF0D5] text-amber-700 px-3 py-1.5 rounded-full shrink-0">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* Assignment List */}
        <section className="w-full min-w-0 bg-white rounded-2xl border border-[#E5E9E7] overflow-hidden">

          <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[#173D59]">
                {activeTab === "Dashboard"
                  ? "My Assignments"
                  : activeTab + " Assignments"}
              </h3>

              <p className="text-sm text-[#526273] mt-1">
                Manage and track your assigned tasks
              </p>
            </div>

            <span className="text-sm text-[#526273] shrink-0">
              {displayedAssignments.length} assignments
            </span>
          </div>

          {/* Table has its own horizontal scroll on mobile */}
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
                    <td
                      colSpan="4"
                      className="text-center py-10 text-sm text-[#526273]"
                    >
                      No assignments found.
                    </td>
                  </tr>
                ) : (
                  displayedAssignments.map((assignment) => {
                    const isSubmitted =
                      assignment.submittedBy?.includes(currentUser.id);

                    return (
                      <tr
                        key={assignment.id}
                        className="hover:bg-[#FAFBF8] transition"
                      >
                        <td className="px-5 py-4 min-w-55">
                          <p className="font-semibold text-sm text-[#173D59]">
                            {assignment.title}
                          </p>

                          <p className="text-xs text-[#526273] mt-1 max-w-xs wrap-break-words">
                            {assignment.description}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-[#526273] whitespace-nowrap">
                          {assignment.dueDate}
                        </td>

                        <td className="px-5 py-4">
                          {isSubmitted ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-full whitespace-nowrap">
                              <CheckCircle2 size={14} />
                              Submitted
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

                            {!isSubmitted && (
                              <button
                                onClick={() =>
                                  handleSubmitClick(assignment)
                                }
                                className="text-xs font-semibold text-[#173D59] bg-[#7AAACE] px-3 py-2 rounded-lg hover:bg-[#6699BD] transition whitespace-nowrap"
                              >
                                Submit Assignment
                              </button>
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
      </main>

      {/* Two-step Submission Dialog */}
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
