
function ConfirmDialog({
  isOpen,
  step,
  assignment,
  onNext,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#173D59]/50 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-md rounded-2xl p-7 shadow-xl">

        {step === 1 ? (
          <>
            <h2 className="text-xl font-bold text-[#173D59]">
              Submit Assignment?
            </h2>

            <p className="text-sm text-[#526273] mt-3">
              Have you submitted "{assignment?.title}"?
            </p>

            <div className="flex gap-3 mt-7">

              <button
                onClick={onCancel}
                className="flex-1 border border-[#C6D2D7] text-[#526273] font-semibold py-3 rounded-xl"
              >
                Not yet
              </button>

              <button
                onClick={onNext}
                className="flex-1 bg-[#7AAACE] text-[#173D59] font-bold py-3 rounded-xl"
              >
                Yes, I have submitted
              </button>

            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-[#173D59]">
              Final Confirmation
            </h2>

            <p className="text-sm text-[#526273] mt-3">
              Are you sure you want to mark this assignment as submitted?
              This will update your assignment status.
            </p>

            <div className="flex gap-3 mt-7">

              <button
                onClick={onCancel}
                className="flex-1 border border-[#C6D2D7] text-[#526273] font-semibold py-3 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                className="flex-1 bg-[#7AAACE] text-[#173D59] font-bold py-3 rounded-xl"
              >
                Confirm Submission
              </button>

            </div>
          </>
        )}

      </div>

    </div>
  );
}

export default ConfirmDialog;
