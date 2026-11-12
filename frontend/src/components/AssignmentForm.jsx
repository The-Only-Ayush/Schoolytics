
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { students } from "../data/accounts";

function AssignmentForm({
  isOpen,
  onClose,
  onSave,
  editingAssignment,
  course = null,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [submissionType, setSubmissionType] = useState("individual");

  const [assignToAll, setAssignToAll] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const availableStudents = course
    ? students.filter((student) =>
        course.enrolledStudents?.includes(student.id)
      )
    : students;

  useEffect(() => {
    if (editingAssignment) {
      setTitle(editingAssignment.title || "");
      setDescription(editingAssignment.description || "");
      setDueDate(editingAssignment.dueDate || "");
      setDueTime(editingAssignment.dueTime || "");
      setDriveLink(editingAssignment.driveLink || "");

      setSubmissionType(
        editingAssignment.submissionType || "individual"
      );

      if (editingAssignment.assignedTo === "all") {
        setAssignToAll(true);
        setSelectedStudents([]);
      } else {
        setAssignToAll(false);
        setSelectedStudents(editingAssignment.assignedTo || []);
      }
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
      setDueTime("");
      setDriveLink("");
      setSubmissionType("individual");
      setAssignToAll(true);
      setSelectedStudents([]);
    }
  }, [editingAssignment, isOpen]);

  if (!isOpen) return null;

  const handleStudentChange = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!assignToAll && selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    const assignmentData = {
      title: title.trim(),
      description: description.trim(),
      dueDate,
      dueTime,
      driveLink: driveLink.trim(),
      submissionType,

      assignedTo: assignToAll
        ? course
          ? availableStudents.map((student) => student.id)
          : "all"
        : selectedStudents,

      ...(course ? { courseId: course.id } : {}),
    };

    onSave(assignmentData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#173D59]/50 flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-2xl max-h-[95dvh] sm:max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

        {/* Form Header */}
        <div className="flex items-start justify-between gap-3 p-4 sm:p-6 border-b border-[#E5E9E7] sticky top-0 bg-white z-10">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-[#173D59] wrap-break-words">
              {editingAssignment
                ? "Edit Assignment"
                : "Create New Assignment"}
            </h2>

            <p className="text-xs sm:text-sm text-[#526273] mt-1">
              {course
                ? `Create an assignment for ${course.title}.`
                : "Enter assignment details and select students."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close assignment form"
            className="p-2 shrink-0 rounded-lg text-[#526273] hover:bg-[#F0F1E8] transition"
          >
            <X size={21} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">

          {/* Assignment Title */}
          <div>
            <label className="block text-sm font-semibold text-[#173D59] mb-2">
              Assignment Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. JavaScript Array Methods"
              required
              className="w-full min-w-0 border border-[#DCE3E5] rounded-xl px-4 py-3 text-sm text-[#173D59] outline-none focus:border-[#7AAACE] focus:ring-2 focus:ring-[#7AAACE]/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#173D59] mb-2">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter assignment instructions..."
              rows={3}
              required
              className="w-full min-w-0 border border-[#DCE3E5] rounded-xl px-4 py-3 text-sm text-[#173D59] outline-none resize-none focus:border-[#7AAACE] focus:ring-2 focus:ring-[#7AAACE]/20"
            />
          </div>

          {/* Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="min-w-0">
              <label className="block text-sm font-semibold text-[#173D59] mb-2">
                Deadline Date
              </label>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full min-w-0 border border-[#DCE3E5] rounded-xl px-4 py-3 text-sm text-[#173D59] outline-none focus:border-[#7AAACE] focus:ring-2 focus:ring-[#7AAACE]/20"
              />
            </div>

            <div className="min-w-0">
              <label className="block text-sm font-semibold text-[#173D59] mb-2">
                Deadline Time
              </label>

              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                required
                className="w-full min-w-0 border border-[#DCE3E5] rounded-xl px-4 py-3 text-sm text-[#173D59] outline-none focus:border-[#7AAACE] focus:ring-2 focus:ring-[#7AAACE]/20"
              />
            </div>
          </div>

          {/* Drive Link */}
          <div>
            <label className="block text-sm font-semibold text-[#173D59] mb-2">
              OneDrive / Google Drive Link
            </label>

            <input
              type="url"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              required
              className="w-full min-w-0 border border-[#DCE3E5] rounded-xl px-4 py-3 text-sm text-[#173D59] outline-none focus:border-[#7AAACE] focus:ring-2 focus:ring-[#7AAACE]/20"
            />
          </div>

          {/* Submission Type */}
          <div>
            <label className="block text-sm font-semibold text-[#173D59] mb-3">
              Submission Type
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E9E7] cursor-pointer hover:bg-[#F7F8F0] transition">
                <input
                  type="radio"
                  name="submissionType"
                  value="individual"
                  checked={submissionType === "individual"}
                  onChange={(e) => setSubmissionType(e.target.value)}
                  className="accent-[#397BA6] shrink-0"
                />

                <span className="text-sm font-medium text-[#173D59]">
                  Individual Submission
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E9E7] cursor-pointer hover:bg-[#F7F8F0] transition">
                <input
                  type="radio"
                  name="submissionType"
                  value="group"
                  checked={submissionType === "group"}
                  onChange={(e) => setSubmissionType(e.target.value)}
                  className="accent-[#397BA6] shrink-0"
                />

                <span className="text-sm font-medium text-[#173D59]">
                  Group Submission
                </span>
              </label>
            </div>
          </div>

          {/* Assign Students */}
          <div>
            <label className="block text-sm font-semibold text-[#173D59] mb-3">
              Assign To
            </label>

            <div className="space-y-3">

              {/* All Students */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E9E7] cursor-pointer hover:bg-[#F7F8F0] transition">
                <input
                  type="radio"
                  name="assignTo"
                  checked={assignToAll}
                  onChange={() => setAssignToAll(true)}
                  className="accent-[#397BA6] shrink-0"
                />

                <span className="text-sm font-medium text-[#173D59]">
                  All Students ({availableStudents.length})
                </span>
              </label>

              {/* Selected Students */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E9E7] cursor-pointer hover:bg-[#F7F8F0] transition">
                <input
                  type="radio"
                  name="assignTo"
                  checked={!assignToAll}
                  onChange={() => setAssignToAll(false)}
                  className="accent-[#397BA6] shrink-0"
                />

                <span className="text-sm font-medium text-[#173D59]">
                  Select Specific Students
                </span>
              </label>

              {/* Student Selection */}
              {!assignToAll && (
                <div className="border border-[#E5E9E7] rounded-xl p-3 sm:p-4 space-y-3">
                  <p className="text-xs text-[#526273]">
                    Select the students who should receive this assignment.
                  </p>

                  {availableStudents.length === 0 ? (
                    <p className="text-sm text-[#526273]">
                      No students are enrolled in this course.
                    </p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-3 pr-2">
                      {availableStudents.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() =>
                              handleStudentChange(student.id)
                            }
                            className="w-4 h-4 accent-[#397BA6] shrink-0"
                          />

                          <span className="text-sm text-[#173D59] wrap-break-words">
                            {student.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[#E5E9E7]">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#DCE3E5] text-[#526273] text-sm font-semibold hover:bg-[#F7F8F0] transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#173D59] text-white text-sm font-semibold hover:bg-[#245474] transition"
            >
              {editingAssignment
                ? "Save Changes"
                : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignmentForm;
