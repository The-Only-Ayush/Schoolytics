
import {
  CalendarDays,
  FileText,
  ExternalLink,
  Users,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

import { students } from "../data/accounts";

function AssignmentDetails({ assignment, onClose }) {
  if (!assignment) return null;

  const assignedStudents =
    assignment.assignedTo === "all"
      ? students
      : students.filter((student) =>
          assignment.assignedTo?.some(
            (id) => String(id) === String(student.id)
          )
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

  const total = assignedStudents.length;
  const submitted = submittedStudents.length;

  const progress =
    total === 0 ? 0 : Math.round((submitted / total) * 100);

  const formattedDate = assignment.dueDate
    ? new Date(`${assignment.dueDate}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "Not specified";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl max-h-[95dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#E5E9E7] flex justify-between items-start gap-3 shrink-0">
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#397BA6] uppercase tracking-wider mb-2">
              Assignment Details
            </p>

            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-[#173D59] wrap-break-words">
              {assignment.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close assignment details"
            className="p-2 shrink-0 rounded-lg text-[#526273] hover:bg-[#F0F1E8] transition"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto min-h-0">

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText size={19} className="text-[#397BA6] shrink-0" />
              <h3 className="font-bold text-[#173D59]">
                Description
              </h3>
            </div>

            <p className="text-sm text-[#526273] leading-7 bg-[#F7F8F0] rounded-xl p-3 sm:p-4 whitespace-pre-wrap wrap-break-words">
              {assignment.description || "No description provided."}
            </p>
          </div>

          {/* Assignment Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-[#E5E9E7] rounded-xl p-4 min-w-0">
              <div className="flex items-center gap-2 text-[#526273] mb-2">
                <CalendarDays size={18} className="shrink-0" />
                <span className="text-sm">Due Date</span>
              </div>

              <p className="font-semibold text-[#173D59] wrap-break-words">
                {formattedDate}
              </p>
            </div>

            <div className="border border-[#E5E9E7] rounded-xl p-4 min-w-0">
              <div className="flex items-center gap-2 text-[#526273] mb-2">
                <Users size={18} className="shrink-0" />
                <span className="text-sm">Assigned Students</span>
              </div>

              <p className="font-semibold text-[#173D59]">
                {total} Students
              </p>
            </div>
          </div>

          {/* Drive Link */}
          <div>
            <h3 className="font-bold text-[#173D59] mb-3">
              Assignment Resource
            </h3>

            {assignment.driveLink ? (
              <a
                href={assignment.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-full items-center gap-2 bg-[#EAF1F4] text-[#245675] px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#DCEAF1] transition"
              >
                <span className="break-all">
                  Open Google Drive Link
                </span>
                <ExternalLink size={16} className="shrink-0" />
              </a>
            ) : (
              <p className="text-sm text-[#526273]">
                No Drive link provided.
              </p>
            )}
          </div>

          {/* Submission Progress */}
          <div className="bg-[#F7F8F0] rounded-xl p-4 sm:p-5">
            <div className="flex justify-between items-center gap-3 mb-3">
              <div className="min-w-0">
                <h3 className="font-bold text-[#173D59]">
                  Submission Progress
                </h3>

                <p className="text-xs text-[#526273] mt-1">
                  {submitted} out of {total} students submitted
                </p>
              </div>

              <p className="text-xl sm:text-2xl font-bold text-[#173D59] shrink-0">
                {progress}%
              </p>
            </div>

            <div className="w-full h-3 bg-[#E1E6E3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7AAACE] rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white rounded-lg p-3 min-w-0">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 size={17} className="shrink-0" />
                  <span className="text-xs font-semibold">
                    Submitted
                  </span>
                </div>

                <p className="text-xl font-bold text-[#173D59] mt-1">
                  {submitted}
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 min-w-0">
                <div className="flex items-center gap-2 text-orange-600">
                  <Clock size={17} className="shrink-0" />
                  <span className="text-xs font-semibold">
                    Pending
                  </span>
                </div>

                <p className="text-xl font-bold text-[#173D59] mt-1">
                  {pendingStudents.length}
                </p>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div>
            <h3 className="font-bold text-[#173D59] mb-4">
              Student Submission Status
            </h3>

            <div className="space-y-3">
              {assignedStudents.map((student) => {
                const hasSubmitted = assignment.submittedBy?.some(
                  (id) => String(id) === String(student.id)
                );

                return (
                  <div
                    key={student.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-xl border border-[#E5E9E7]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#7AAACE] text-[#173D59] flex items-center justify-center font-bold text-sm shrink-0">
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
                      <span className="self-start sm:self-auto text-xs font-semibold text-green-700 bg-green-100 px-3 py-2 rounded-full shrink-0">
                        Submitted
                      </span>
                    ) : (
                      <span className="self-start sm:self-auto text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-2 rounded-full shrink-0">
                        Pending
                      </span>
                    )}
                  </div>
                );
              })}

              {total === 0 && (
                <p className="text-sm text-[#526273] text-center py-5">
                  No students assigned.
                </p>
              )}
            </div>
          </div>
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

export default AssignmentDetails;
