
import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Users,
  Search,
} from "lucide-react";

import { students } from "../data/accounts";
import { useAppContext } from "../context/AppContext";

function StudentSubmissionList({ assignment, onClose }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { groups } = useAppContext();

  if (!assignment) return null;

  // Get registered users as well as demo students.
  const registeredUsers = JSON.parse(
    localStorage.getItem("registeredUsers") || "[]"
  );

  const allStudents = [
    ...students,
    ...registeredUsers
      .filter((user) => user.role === "student")
      .map(({ password, ...user }) => user),
  ];

  const getStudentDetails = (studentId) =>
    allStudents.find(
      (student) => String(student.id) === String(studentId)
    ) || {
      id: studentId,
      name: "Unknown Student",
      email: "",
      initials: "US",
    };

  // Check whether a student is assigned.
  const isStudentAssigned = (studentId) => {
    if (assignment.assignedTo === "all") return true;

    return assignment.assignedTo?.some(
      (id) => String(id) === String(studentId)
    );
  };

  // Format acknowledgement date and time.
  const formatDateTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const isGroupAssignment =
    assignment.submissionType === "group";

  // Individual assignment data.
  const assignedStudents = allStudents.filter((student) =>
    isStudentAssigned(student.id)
  );

  const submittedStudents = assignedStudents.filter((student) =>
    assignment.submittedBy?.some(
      (id) => String(id) === String(student.id)
    )
  );

  const pendingStudents = assignedStudents.filter(
    (student) =>
      !assignment.submittedBy?.some(
        (id) => String(id) === String(student.id)
      )
  );

  // Group assignment data.
  const assignedGroups = isGroupAssignment
    ? groups.filter((group) => {
        const belongsToCourse =
          String(group.courseId) === String(assignment.courseId);

        const hasAssignedMember = group.members.some((memberId) =>
          isStudentAssigned(memberId)
        );

        return belongsToCourse && hasAssignedMember;
      })
    : [];

  const getGroupSubmission = (groupId) =>
    assignment.groupSubmissions?.find(
      (submission) =>
        String(submission.groupId) === String(groupId)
    );

  const submittedGroups = assignedGroups.filter((group) =>
    Boolean(getGroupSubmission(group.id))
  );

  const pendingGroups = assignedGroups.filter(
    (group) => !getGroupSubmission(group.id)
  );

  // Select the correct statistics.
  const total = isGroupAssignment
    ? assignedGroups.length
    : assignedStudents.length;

  const submitted = isGroupAssignment
    ? submittedGroups.length
    : submittedStudents.length;

  const pending = total - submitted;

  const progress =
    total === 0 ? 0 : Math.round((submitted / total) * 100);

  // Apply search and status filters for individuals.
  const filteredStudents = assignedStudents.filter((student) => {
    const hasSubmitted = assignment.submittedBy?.some(
      (id) => String(id) === String(student.id)
    );

    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "submitted" && hasSubmitted) ||
      (statusFilter === "pending" && !hasSubmitted);

    return matchesSearch && matchesStatus;
  });

  // Apply search and status filters for groups.
  const filteredGroups = assignedGroups.filter((group) => {
    const leader = getStudentDetails(group.leaderId);
    const hasSubmitted = Boolean(getGroupSubmission(group.id));

    const memberNames = group.members
      .map((memberId) => getStudentDetails(memberId).name)
      .join(" ");

    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      memberNames.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "submitted" && hasSubmitted) ||
      (statusFilter === "pending" && !hasSubmitted);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[95dvh] sm:max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#E5E9E7] flex justify-between items-start gap-3 shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[#173D59] wrap-break-words">
              {isGroupAssignment
                ? "Group Submissions"
                : "Student Submissions"}
            </h2>

            <p className="text-sm text-[#526273] mt-1 wrap-break-words">
              {assignment.title}
            </p>

            <span className="inline-block mt-2 text-xs font-semibold bg-[#EAF1F4] text-[#397BA6] px-3 py-1 rounded-full">
              {isGroupAssignment
                ? "Group Assignment"
                : "Individual Assignment"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close submission details"
            className="shrink-0 p-2 rounded-lg text-[#526273] hover:text-red-600 hover:bg-[#F7F8F0] transition"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto min-h-0">

          {/* Progress */}
          <div className="bg-[#F7F8F0] rounded-xl p-4 sm:p-5 mb-6">
            <div className="flex justify-between items-center gap-3 mb-3">
              <div>
                <p className="text-sm text-[#526273]">
                  Class completion
                </p>

                <p className="text-2xl font-bold text-[#173D59]">
                  {progress}%
                </p>
              </div>

              <Users
                size={26}
                className="text-[#397BA6] shrink-0"
              />
            </div>

            <div className="w-full h-3 bg-[#E1E6E3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7AAACE] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-xs text-[#526273] mt-2">
              {submitted} of {total}{" "}
              {isGroupAssignment ? "groups" : "students"} acknowledged
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="border border-[#E5E9E7] rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-[#526273]">
                Acknowledged
              </p>

              <p className="text-2xl font-bold text-green-700">
                {submitted}
              </p>
            </div>

            <div className="border border-[#E5E9E7] rounded-xl p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-[#526273]">
                Pending
              </p>

              <p className="text-2xl font-bold text-orange-600">
                {pending}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#526273]"
            />

            <input
              type="text"
              placeholder={
                isGroupAssignment
                  ? "Search groups, leaders or members..."
                  : "Search students by name or email..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-w-0 pl-10 pr-4 py-3 border border-[#E5E9E7] rounded-xl text-sm outline-none focus:border-[#7AAACE]"
            />
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs font-semibold transition ${
                statusFilter === "all"
                  ? "bg-[#173D59] text-white"
                  : "bg-[#F7F8F0] text-[#526273] hover:bg-[#E8EEF0]"
              }`}
            >
              All ({total})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("submitted")}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs font-semibold transition ${
                statusFilter === "submitted"
                  ? "bg-green-700 text-white"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              Acknowledged ({submitted})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-3 sm:px-4 py-2 rounded-full text-xs font-semibold transition ${
                statusFilter === "pending"
                  ? "bg-orange-600 text-white"
                  : "bg-orange-50 text-orange-700 hover:bg-orange-100"
              }`}
            >
              Pending ({pending})
            </button>
          </div>

          {/* Individual Student List */}
          {!isGroupAssignment && (
            <>
              <h3 className="font-bold text-[#173D59] mb-3">
                Student Status
              </h3>

              <div className="space-y-3">
                {filteredStudents.map((student) => {
                  const hasSubmitted = assignment.submittedBy?.some(
                    (id) => String(id) === String(student.id)
                  );

                  return (
                    <div
                      key={student.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl bg-[#F7F8F0]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-[#7AAACE] text-[#173D59] flex items-center justify-center font-bold text-sm">
                          {student.initials}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#173D59] wrap-break-words">
                            {student.name}
                          </p>

                          <p className="text-xs text-[#526273] break-all">
                            {student.email}
                          </p>
                        </div>
                      </div>

                      {hasSubmitted ? (
                        <span className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-3 py-2 rounded-full">
                          <CheckCircle2 size={14} />
                          Submitted
                        </span>
                      ) : (
                        <span className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-2 rounded-full">
                          <Clock size={14} />
                          Pending
                        </span>
                      )}
                    </div>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <p className="text-center text-sm text-[#526273] py-6">
                    {total === 0
                      ? "No students assigned to this assignment."
                      : "No students found matching your search or filter."}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Group List */}
          {isGroupAssignment && (
            <>
              <h3 className="font-bold text-[#173D59] mb-3">
                Group Status
              </h3>

              <div className="space-y-3">
                {filteredGroups.map((group) => {
                  const leader = getStudentDetails(group.leaderId);
                  const submission = getGroupSubmission(group.id);
                  const hasSubmitted = Boolean(submission);

                  return (
                    <div
                      key={group.id}
                      className="p-3 sm:p-4 rounded-xl bg-[#F7F8F0] min-w-0"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[#173D59] wrap-break-words">
                            {group.name}
                          </p>

                          <p className="text-xs text-[#526273] mt-1 wrap-break-words">
                            Leader: {leader.name}
                          </p>
                        </div>

                        {hasSubmitted ? (
                          <span className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-3 py-2 rounded-full">
                            <CheckCircle2 size={14} />
                            Acknowledged
                          </span>
                        ) : (
                          <span className="self-start sm:self-auto shrink-0 inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-2 rounded-full">
                            <Clock size={14} />
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#E1E6E3]">
                        <p className="text-xs font-semibold text-[#526273] mb-2">
                          Members ({group.members.length})
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {group.members.map((memberId) => {
                            const member = getStudentDetails(memberId);

                            return (
                              <span
                                key={memberId}
                                className="max-w-full text-xs bg-white border border-[#E5E9E7] text-[#526273] px-3 py-1.5 rounded-full wrap-break-words"
                              >
                                {member.name}
                                {String(memberId) === String(group.leaderId)
                                  ? " (Leader)"
                                  : ""}
                              </span>
                            );
                          })}
                        </div>

                        {hasSubmitted && (
                          <p className="text-xs text-green-700 mt-3 wrap-break-words">
                            Acknowledged by {leader.name} on{" "}
                            {formatDateTime(submission.acknowledgedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredGroups.length === 0 && (
                  <p className="text-center text-sm text-[#526273] py-6">
                    {total === 0
                      ? "No groups are available for this course yet."
                      : "No groups found matching your search or filter."}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#E5E9E7] flex justify-end shrink-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl bg-[#173D59] text-white text-sm font-semibold hover:bg-[#245675] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentSubmissionList;
