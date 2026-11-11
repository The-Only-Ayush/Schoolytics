
import { useState } from "react";

import {
  Check,
  LayoutDashboard,
  ClipboardList,
  CheckCircle2,
  Clock,
  LogOut,
  AlertTriangle,
  Menu,
  X,
  BookOpen,
  Users,
} from "lucide-react";

function Sidebar({
  currentUser,
  activeTab,
  onTabChange,
  onLogout,
  counts = {
    total: 0,
    completed: 0,
    pending: 0,
  },
}) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems =
    currentUser?.role === "admin"
      ? [
          { name: "Dashboard", icon: LayoutDashboard, count: null },
          { name: "Courses", icon: BookOpen, count: null },
          { name: "Assignments", icon: ClipboardList, count: counts.total },
          { name: "Completed", icon: CheckCircle2, count: counts.completed },
          { name: "Past due", icon: AlertTriangle, count: counts.pending },
        ]
      : [
          { name: "Dashboard", icon: LayoutDashboard, count: null },
          { name: "Assignments", icon: ClipboardList, count: counts.total },
          { name: "Groups", icon: Users, count: null },
          { name: "Completed", icon: CheckCircle2, count: counts.completed },
          { name: "Pending", icon: Clock, count: counts.pending },
        ];

  const handleTabChange = (tab) => {
    onTabChange(tab);
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-60 bg-white text-[#173D59] p-3 rounded-xl shadow-md border border-[#E5E9E7]"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="app-sidebar"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={`
          fixed md:sticky
          top-0 left-0
          z-50 md:z-auto
          w-72 md:w-70
          max-w-[85vw]
          h-screen
          bg-white
          border-r border-[#E5E9E7]
          flex flex-col shrink-0
          overflow-y-auto
          pt-16 md:pt-0
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-7 py-7">
          <div className="bg-[#7AAACE] text-[#173D59] p-2.5 rounded-xl">
            <Check size={25} strokeWidth={3} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#173D59]">
              Schoolytics
            </h2>

            <p className="text-xs text-[#526273]">
              Assignments
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 mt-3 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            return (
              <button
                key={item.name}
                onClick={() => handleTabChange(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition duration-200 ${
                  isActive
                    ? "bg-[#7AAACE] text-[#173D59] font-bold"
                    : "text-[#526273] hover:bg-[#EAF1F4]"
                }`}
              >
                <Icon size={20} />

                <span className="flex-1 text-left text-sm">
                  {item.name}
                </span>

                {item.count !== null && (
                  <span className="text-xs font-semibold bg-[#F0F1E8] text-[#526273] px-2.5 py-1 rounded-full">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile and Logout */}
        <div className="mt-auto p-4">
          <div className="flex items-center gap-3 bg-[#F0F1E8] rounded-2xl p-3">
            <div className="w-10 h-10 rounded-full bg-[#7AAACE] flex items-center justify-center text-sm font-bold text-[#173D59] shrink-0">
              {currentUser?.initials || "U"}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#173D59] truncate">
                {currentUser?.name}
              </p>

              <p className="text-xs text-[#526273] capitalize">
                {currentUser?.role === "admin" ? "Professor" : "Student"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="text-[#526273] hover:text-red-600 transition"
            >
              <LogOut size={19} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
