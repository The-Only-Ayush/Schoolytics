import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Check,
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

import { students, teachers } from "../data/accounts";
import { useAppContext } from "../context/AppContext";

function Login() {
  const navigate = useNavigate();

  const { currentUser, token, login, register } = useAppContext();

  // Step 1D: Redirect users who already have an active session
  useEffect(() => {
    if (currentUser && token) {
      if (currentUser.role === "student") {
        navigate("/student", { replace: true });
      } else if (currentUser.role === "admin") {
        navigate("/admin", { replace: true });
      }
    }
  }, [currentUser, token, navigate]);

  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const isRegister = mode === "register";

  const updateField = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (isRegister && !formData.name.trim()) {
      newErrors.name = "Please enter your full name.";
    } else if (
      isRegister &&
      formData.name.trim().length < 2
    ) {
      newErrors.name = "Name must contain at least 2 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (
      isRegister &&
      formData.password.length < 6
    ) {
      newErrors.password =
        "Password must contain at least 6 characters.";
    }

    if (
      isRegister &&
      !formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (
      isRegister &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    if (
      isRegister &&
      !["student", "professor"].includes(formData.role)
    ) {
      newErrors.role = "Please select a valid role.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setMessage("");

    if (!validateForm()) return;

    if (isRegister) {
      const result = register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });

      if (!result.success) {
        setMessage(result.message);
        setMessageType("error");
        return;
      }

      setMessage(result.message);
      setMessageType("success");

      setFormData((prev) => ({
        ...prev,
        name: "",
        email: prev.email.trim().toLowerCase(),
        password: "",
        confirmPassword: "",
      }));

      setErrors({});
      setMode("login");

      return;
    }

    const result = login(
      formData.email.trim(),
      formData.password
    );

    if (!result.success) {
      setMessage(result.message);
      setMessageType("error");
      return;
    }

    if (result.user.role === "student") {
      navigate("/student", { replace: true });
    } else {
      navigate("/admin", { replace: true });
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setMessage("");

    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    });
  };

  // Quick-fill demo accounts
  const useDemoAccount = (account, role) => {
    setMode("login");
    setErrors({});
    setMessage("");

    setFormData({
      name: "",
      email: account.email,
      password: "demo123",
      confirmPassword: "",
      role,
    });
  };

  const allDemoAccounts = [
    ...students.map((account) => ({
      ...account,
      role: "student",
    })),

    ...teachers.map((account) => ({
      ...account,
      role: "professor",
    })),
  ];

  const inputClass =
    "w-full bg-white border border-[#C6D2D7] rounded-xl px-4 py-3.5 text-sm text-[#173D59] outline-none focus:ring-2 focus:ring-[#7AAACE] focus:border-[#7AAACE] transition";

  const errorClass = "text-xs text-red-600 mt-1.5";

  return (
    <div className="min-h-screen w-full max-w-full grid grid-cols-1 lg:grid-cols-2 overflow-x-hidden lg:h-screen lg:min-h-0 lg:overflow-hidden">

      {/* LEFT SECTION */}
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
              Student & Assignment Management
            </p>
          </div>
        </div>

        {/* HERO CONTENT */}
        <div className="my-auto py-8 w-full min-w-0 max-w-xl">

          <span className="inline-flex items-center gap-2 bg-[#F7F8F0]/60 text-[#173D59] text-xs font-semibold px-3 py-2 rounded-full mb-5">
            <Check size={14} />
            One platform. Every assignment.
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-[#173D59]">
            Every assignment and submission in one place.
          </h1>

          <p className="text-sm sm:text-base text-[#173D59]/90 mt-5 leading-relaxed">
            Professors manage courses, assignments and
            submissions. Students stay updated, collaborate
            with groups and track their progress.
          </p>

          {/* PREVIEW CARD */}
          <div className="w-full max-w-md min-w-0 bg-[#F7F8F0] rounded-2xl p-4 md:p-5 mt-8 shadow-lg">

            <div className="flex justify-between items-center gap-3">
              <span className="bg-[#E9EBDD] text-[#173D59] text-xs font-semibold px-3 py-1.5 rounded-full">
                Assignment progress
              </span>

              <span className="text-lg font-bold text-[#173D59]">
                60%
              </span>
            </div>

            <h3 className="text-base font-bold text-[#173D59] mt-4">
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

          {/* FEATURES */}
          <div className="grid grid-cols-2 gap-3 mt-6 max-w-md">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#173D59]">
              <GraduationCap size={19} />
              Student workspace
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-[#173D59]">
              <ShieldCheck size={19} />
              Professor workspace
            </div>
          </div>
        </div>

        <p className="text-xs text-[#173D59]/75 mt-4">
          © 2026 Schoolytics. All rights reserved.
        </p>
      </section>

      {/* RIGHT SECTION */}
      <section className="w-full min-w-0 bg-[#F7F8F0] px-5 sm:px-8 py-8 md:px-12 lg:px-14 lg:h-screen lg:overflow-y-auto lg:overscroll-contain flex items-start justify-center">

        <div className="w-full min-w-0 max-w-lg">

          {/* LOGIN / REGISTER SWITCH */}
          <div className="flex justify-end gap-2 mb-9">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                !isRegister
                  ? "bg-[#7AAACE] text-[#173D59]"
                  : "bg-white border border-[#DCE1D4] text-[#526273] hover:bg-[#EAF1F4]"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition ${
                isRegister
                  ? "bg-[#7AAACE] text-[#173D59]"
                  : "bg-white border border-[#DCE1D4] text-[#526273] hover:bg-[#EAF1F4]"
              }`}
            >
              Register
            </button>
          </div>

          {/* HEADING */}
          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#173D59]">
              {isRegister
                ? "Create your account"
                : "Welcome back!"}
            </h1>

            <p className="text-sm sm:text-base text-[#526273] mt-3 leading-relaxed">
              {isRegister
                ? "Join Schoolytics and manage your academic work."
                : "Log in to access your courses, assignments and progress."}
            </p>
          </div>

          {/* SUCCESS / ERROR MESSAGE */}
          {message && (
            <div
              role="alert"
              className={`mb-5 p-3.5 rounded-xl text-sm border ${
                messageType === "success"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* NAME */}
            {isRegister && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-[#173D59] mb-2"
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={updateField}
                  placeholder="Enter your full name"
                  className={inputClass}
                />

                {errors.name && (
                  <p className={errorClass}>{errors.name}</p>
                )}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#173D59] mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={updateField}
                placeholder="you@example.com"
                className={inputClass}
              />

              {errors.email && (
                <p className={errorClass}>{errors.email}</p>
              )}
            </div>

            {/* ROLE */}
            {isRegister && (
              <div>
                <label className="block text-sm font-semibold text-[#173D59] mb-3">
                  Register as
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        role: "student",
                      }))
                    }
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-semibold text-sm transition ${
                      formData.role === "student"
                        ? "bg-[#EAF1F4] border-[#7AAACE] text-[#173D59] ring-1 ring-[#7AAACE]"
                        : "bg-white border-[#DCE1D4] text-[#526273] hover:bg-[#EAF1F4]"
                    }`}
                  >
                    <GraduationCap size={19} />
                    Student
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        role: "professor",
                      }))
                    }
                    className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-semibold text-sm transition ${
                      formData.role === "professor"
                        ? "bg-[#EAF1F4] border-[#7AAACE] text-[#173D59] ring-1 ring-[#7AAACE]"
                        : "bg-white border-[#DCE1D4] text-[#526273] hover:bg-[#EAF1F4]"
                    }`}
                  >
                    <ShieldCheck size={19} />
                    Professor
                  </button>
                </div>

                {errors.role && (
                  <p className={errorClass}>{errors.role}</p>
                )}
              </div>
            )}

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#173D59] mb-2"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  value={formData.password}
                  onChange={updateField}
                  placeholder="Enter your password"
                  className={`${inputClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#526273] hover:text-[#173D59]"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className={errorClass}>{errors.password}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            {isRegister && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-[#173D59] mb-2"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={updateField}
                    placeholder="Re-enter your password"
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#526273] hover:text-[#173D59]"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className={errorClass}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#7AAACE] hover:bg-[#6699BD] text-[#173D59] font-bold py-4 rounded-xl transition duration-200 shadow-sm"
            >
              {isRegister ? "Create Account" : "Login to Dashboard"}
              <ArrowRight size={19} />
            </button>
          </form>

          {/* MODE SWITCH TEXT */}
          <p className="text-center text-sm text-[#526273] mt-6">
            {isRegister
              ? "Already have an account?"
              : "Don't have an account?"}

            <button
              type="button"
              onClick={() =>
                switchMode(isRegister ? "login" : "register")
              }
              className="ml-1 font-bold text-[#397BA6] hover:underline"
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </p>

          {/* DEMO ACCOUNTS */}
          {!isRegister && (
            <div className="mt-9 pb-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#173D59]">
                  Demo Accounts
                </h2>

                <p className="text-sm text-[#526273] mt-1">
                  Select an account to automatically fill the login form.
                </p>

                <p className="text-xs text-[#526273] mt-2">
                  Demo password: <strong>demo123</strong>
                </p>
              </div>

              <div className="w-full bg-white border border-[#C6D2D7] rounded-xl divide-y divide-[#E1E7E6]">
                {allDemoAccounts.map((account) => (
                  <button
                    key={`${account.role}-${account.id}`}
                    type="button"
                    onClick={() =>
                      useDemoAccount(account, account.role)
                    }
                    className="w-full flex items-center gap-3 p-3 sm:p-4 text-left transition hover:bg-[#EAF1F4]"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#7AAACE] flex items-center justify-center text-sm font-bold text-[#173D59] shrink-0">
                      {account.initials}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#173D59]">
                        {account.name}
                      </p>

                      <p className="text-xs text-[#526273] truncate">
                        {account.email}
                      </p>

                      <p className="text-xs text-[#397BA6] mt-1">
                        {account.role === "student"
                          ? "Student"
                          : "Professor"}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-[#397BA6] shrink-0">
                      Use
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Login;