
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Check,
  ChevronDown,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import { students, teachers } from "../data/accounts";
import { useAppContext } from "../context/AppContext";

function Login() {
  const navigate = useNavigate();

  const { setCurrentUser } = useAppContext();

  const [role, setRole] = useState("student");
  const [selectedAccount, setSelectedAccount] = useState("");

  // Getting accounts according to role
  const accounts = role === "student" ? students : teachers;

  // Changing role
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setSelectedAccount("");
  };

  // Continue to dashboard
  const handleContinue = () => {
    if (!selectedAccount) return;

    const user = accounts.find(
      (account) => account.id === Number(selectedAccount)
    );

    if (!user) return;

    setCurrentUser({
      ...user,
      role,
    });

    if (role === "student") {
      navigate("/student");
    } else {
      navigate("/admin");
    }
  };

  const selectedUser = accounts.find(
    (account) => account.id === Number(selectedAccount)
  );

  return (
    <div className="min-h-screen w-full max-w-full grid grid-cols-1 lg:grid-cols-2 overflow-x-hidden lg:h-screen lg:min-h-0 lg:overflow-hidden">

      {/* LEFT SECTION - FIXED ON DESKTOP */}
      <section className="w-full min-w-0 bg-[#7AAACE] px-5 sm:px-8 py-7 md:px-10 lg:px-12 xl:px-14 lg:h-screen lg:overflow-hidden flex flex-col">

        {/* BRAND */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-[#173D59] text-[#F7F8F0] p-2 rounded-xl">
            <Check size={24} strokeWidth={3} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#173D59]">
              Schoolytics
            </h2>

            <p className="text-xs text-[#173D59]/80">
              Assignments
            </p>
          </div>
        </div>

        {/* HERO CONTENT */}
        <div className="my-auto py-7 lg:py-8 w-full min-w-0 max-w-xl">

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-[#173D59] wrap-break-words">
            Every assignment and submission in one place.
          </h1>

          <p className="text-sm sm:text-base text-[#173D59]/90 mt-4 leading-relaxed wrap-break-words">
            Professors post work and see who has submitted.
            Students see what's due and confirm when it's done.
          </p>

          {/* PREVIEW CARD */}
          <div className="w-full max-w-md min-w-0 bg-[#F7F8F0] rounded-2xl p-4 md:p-5 mt-6 sm:mt-8 shadow-lg">

            <div className="flex justify-between items-center gap-3">

              <span className="bg-[#E9EBDD] text-[#173D59] text-xs font-semibold px-3 py-1.5 rounded-full">
                Due in 3 days
              </span>

              <span className="text-lg font-bold text-[#173D59] shrink-0">
                60%
              </span>

            </div>

            <h3 className="text-base font-bold text-[#173D59] mt-4 wrap-break-words">
              ER diagram for a library system
            </h3>

            <p className="text-xs text-[#526273] mt-1">
              3 of 5 students submitted
            </p>

            <div className="flex gap-1.5 mt-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className={`h-2 flex-1 rounded-full ${
                    item <= 3
                      ? "bg-[#4C83A8]"
                      : "bg-[#DCE1D4]"
                  }`}
                />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* RIGHT SECTION - INDEPENDENT SCROLL */}
      <section className="w-full min-w-0 bg-[#F7F8F0] px-5 sm:px-8 py-8 md:px-12 lg:px-14 lg:h-screen lg:overflow-y-auto lg:overscroll-contain flex items-start justify-center">

        <div className="w-full min-w-0 max-w-lg">

          {/* ROLE NAVIGATION */}
          <div className="flex flex-wrap justify-start sm:justify-end gap-3 mb-10 sm:mb-12">

            <button
              onClick={() => handleRoleChange("student")}
              className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-lg font-semibold text-sm sm:text-base transition ${
                role === "student"
                  ? "bg-[#7AAACE] text-[#173D59]"
                  : "bg-white text-[#526273] border border-[#DCE1D4] hover:bg-[#EAF1F4]"
              }`}
            >
              <GraduationCap size={18} />
              Student
            </button>

            <button
              onClick={() => handleRoleChange("admin")}
              className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-3 sm:px-5 py-2.5 rounded-lg font-semibold text-sm sm:text-base transition ${
                role === "admin"
                  ? "bg-[#7AAACE] text-[#173D59]"
                  : "bg-white text-[#526273] border border-[#DCE1D4] hover:bg-[#EAF1F4]"
              }`}
            >
              <ShieldCheck size={18} />
              Admin
            </button>

          </div>

          {/* HEADING */}
          <div className="mb-8 sm:mb-9">

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#173D59] wrap-break-words">
              Welcome to Schoolytics
            </h1>

            <p className="text-sm sm:text-base text-[#526273] mt-3 leading-relaxed">
              {role === "student"
                ? "Select your student account to access your assignments and progress."
                : "Select your admin account to manage assignments and students."}
            </p>

          </div>

          {/* ACCOUNT SELECTOR */}
          <div className="space-y-5">

            <div>

              <label className="block text-sm font-semibold text-[#173D59] mb-3">
                {role === "student" ? "Select Student" : "Select Admin"}
              </label>

              <div className="relative min-w-0">

                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full min-w-0 appearance-none bg-white border border-[#C6D2D7] rounded-xl px-4 py-4 pr-12 text-sm sm:text-base text-[#173D59] outline-none focus:ring-2 focus:ring-[#7AAACE] focus:border-[#7AAACE] cursor-pointer"
                >
                  <option value="">
                    Choose your account
                  </option>

                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} — {account.email}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={20}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#526273] pointer-events-none"
                />

              </div>
            </div>

            {/* SELECTED ACCOUNT PREVIEW */}
            {selectedAccount && selectedUser && (
              <div className="flex items-center gap-3 sm:gap-4 p-4 min-w-0 bg-white border border-[#C6D2D7] rounded-xl">

                <div className="w-12 h-12 rounded-full bg-[#7AAACE] flex items-center justify-center font-bold text-[#173D59] shrink-0">
                  {selectedUser.initials}
                </div>

                <div className="min-w-0">
                  <p className="font-bold text-[#173D59] wrap-break-words">
                    {selectedUser.name}
                  </p>

                  <p className="text-sm text-[#526273]">
                    {role === "student" ? "Student Account" : "Admin Account"}
                  </p>
                </div>

              </div>
            )}

            {/* CONTINUE BUTTON */}
            <button
              onClick={handleContinue}
              disabled={!selectedAccount}
              className="w-full bg-[#7AAACE] hover:bg-[#6699BD] disabled:opacity-50 disabled:cursor-not-allowed text-[#173D59] font-bold py-4 rounded-xl transition duration-200 shadow-sm"
            >
              Continue to Dashboard
            </button>

          </div>

          {/* ACCOUNT INFORMATION */}
          <div className="mt-10 sm:mt-12 pb-5">

            <h2 className="text-lg font-bold text-[#173D59]">
              Demo Accounts
            </h2>

            <p className="text-sm text-[#526273] mt-1 mb-5">
              Choose your role and select an account from the dropdown above.
            </p>

            <div className="w-full min-w-0 bg-white border border-[#C6D2D7] rounded-xl divide-y divide-[#E1E7E6]">

              {accounts.map((account) => (

                <button
                  key={account.id}
                  onClick={() => setSelectedAccount(String(account.id))}
                  className={`w-full min-w-0 flex items-center gap-3 p-3 sm:p-4 text-left transition hover:bg-[#EAF1F4] ${
                    selectedAccount === String(account.id)
                      ? "bg-[#EAF1F4]"
                      : ""
                  }`}
                >

                  <div className="w-10 h-10 rounded-full bg-[#7AAACE] flex items-center justify-center text-sm font-bold text-[#173D59] shrink-0">
                    {account.initials}
                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="font-semibold text-sm sm:text-base text-[#173D59] wrap-break-words">
                      {account.name}
                    </p>

                    <p className="text-xs sm:text-sm text-[#526273] truncate">
                      {account.email}
                    </p>

                  </div>

                  <span className="text-sm font-semibold text-[#397BA6] shrink-0">
                    Use
                  </span>

                </button>

              ))}

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

export default Login;
