
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { students } from "../data/accounts";

function AssignmentForm({
  isOpen,
  onClose,
  onSave,
  editingAssignment,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [assignToAll, setAssignToAll] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Fill the form when editing an existing assignment
  useEffect(() => {
    if (editingAssignment) {
      setTitle(editingAssignment.title || "");
      setDescription(editingAssignment.description || "");
      setDueDate(editingAssignment.dueDate || "");
      setDriveLink(editingAssignment.driveLink || "");

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
      setDriveLink("");
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
      driveLink: driveLink.trim(),
      assignedTo: assignToAll ? "all" : selectedStudents,
    };

    onSave(assignmentData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#173D59]/50 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl">

        {/* Form Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E5E9E7]">
          <div>
            <h2 className="text-xl font-bold text-[#173D59]">
              {editingAssignment
                ? "Edit Assignment"
                : "Create New Assignment"}
            </h2>

            <p className="text-sm text-[#526273] mt-1">
              Enter assignment details and select students.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#526273] hover:bg-[#F0F1E8]"
          >
            <X size={21} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

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
              className="w-full border border-[#DCE3E5] rounded-xl px-4 py-3 text-sm text-[#173D59] outline-none focus:border-[#7AAACE]"
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
              className="w-full border border-[#DCE3E5] rounded-xl px-4 py-3 text-sm text-[#173D59] outline-none resize-none focus:border-[#7AAACE]"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-[#173D59] mb-2">
              Due Date
            </label>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full border border-[#DCE3E5] rounded-xl px-4 py-3 text-sm text-[#173D59] outline-none focus:border-[#7AAACE]"
            />
          </div>

          {/* Drive Link */}
          <div>
            <label className="block text-sm font-semibold text-[#173D59] mb-2">
              Google Drive Link
            </label>

            <input
              type="url"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              required
              className="w-full border border-[#DCE3E5] rounded-xl px-4 py-3 text-sm text-[#173D59] outline-none focus:border-[#7AAACE]"
            />
          </div>

          {/* Assign Students */}
          <div>
            <label className="block text-sm font-semibold text-[#173D59] mb-3">
              Assign To
            </label>

            <div className="space-y-3">

              {/* All Students */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E9E7] cursor-pointer">
                <input
                  type="radio"
                  name="assignTo"
                  checked={assignToAll}
                  onChange={() => setAssignToAll(true)}
                  className="accent-[#397BA6]"
                />

                <span className="text-sm font-medium text-[#173D59]">
                  All Students ({students.length})
                </span>
              </label>

              {/* Selected Students */}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E9E7] cursor-pointer">
                <input
                  type="radio"
                  name="assignTo"
                  checked={!assignToAll}
                  onChange={() => setAssignToAll(false)}
                  className="accent-[#397BA6]"
                />

                <span className="text-sm font-medium text-[#173D59]">
                  Select Specific Students
                </span>
              </label>

              {/* Student Selection */}
              {!assignToAll && (
                <div className="border border-[#E5E9E7] rounded-xl p-4 space-y-3">
                  <p className="text-xs text-[#526273]">
                    Select the students who should receive this assignment.
                  </p>

                  {students.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentChange(student.id)}
                        className="w-4 h-4 accent-[#397BA6]"
                      />

                      <span className="text-sm text-[#173D59]">
                        {student.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E9E7]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-[#DCE3E5] text-[#526273] text-sm font-semibold hover:bg-[#F7F8F0]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-[#173D59] text-white text-sm font-semibold hover:bg-[#245474]"
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
