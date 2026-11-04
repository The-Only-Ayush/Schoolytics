
import { CheckCircle2, Clock, Users } from "lucide-react";
import { students } from "../data/accounts";

function StudentSubmissionList({ assignment, onClose }) {
  if (!assignment) return null;

  const assignedStudents =
    assignment.assignedTo === "all"
      ? students
      : students.filter((student) =>
          assignment.assignedTo?.includes(student.id)
        );

  const submittedStudents = assignedStudents.filter((student) =>
    assignment.submittedBy?.includes(student.id)
  );

  const pendingStudents = assignedStudents.filter(
    (student) => !assignment.submittedBy?.includes(student.id)
  );

  const total = assignedStudents.length;
  const submitted = submittedStudents.length;
  const progress =
    total === 0 ? 0 : Math.round((submitted / total) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="p-6 border-b border-[#E5E9E7] flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-[#173D59]">
              Student Submissions
            </h2>
            <p className="text-sm text-[#526273] mt-1">
              {assignment.title}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-[#526273] hover:text-red-600 text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">

          {/* Progress */}
          <div className="bg-[#F7F8F0] rounded-xl p-5 mb-6">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm text-[#526273]">
                  Class completion
                </p>
                <p className="text-2xl font-bold text-[#173D59]">
                  {progress}%
                </p>
              </div>

              <Users size={28} className="text-[#397BA6]" />
            </div>

            <div className="w-full h-3 bg-[#E1E6E3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#7AAACE] rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-xs text-[#526273] mt-2">
              {submitted} of {total} students submitted
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-[#E5E9E7] rounded-xl p-4">
              <p className="text-sm text-[#526273]">Submitted</p>
              <p className="text-2xl font-bold text-green-700">
                {submitted}
              </p>
            </div>

            <div className="border border-[#E5E9E7] rounded-xl p-4">
              <p className="text-sm text-[#526273]">Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                {pendingStudents.length}
              </p>
            </div>
          </div>

          {/* Student list */}
          <h3 className="font-bold text-[#173D59] mb-3">
            Student Status
          </h3>

          <div className="space-y-3">
            {assignedStudents.map((student) => {
              const hasSubmitted = assignment.submittedBy?.includes(
                student.id
              );

              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F8F0]"
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
                        {student.email}
                      </p>
                    </div>
                  </div>

                  {hasSubmitted ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-3 py-2 rounded-full">
                      <CheckCircle2 size={14} />
                      Submitted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-100 px-3 py-2 rounded-full">
                      <Clock size={14} />
                      Pending
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {total === 0 && (
            <p className="text-center text-sm text-[#526273] py-5">
              No students assigned to this assignment.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#E5E9E7] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#173D59] text-white text-sm font-semibold hover:bg-[#245675]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentSubmissionList;
