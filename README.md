# Schoolytics — Student & Professor Dashboard

Schoolytics is a responsive academic management platform built with React and Tailwind CSS. It provides separate dashboards for students and professors to manage courses, assignments, groups, and submission progress.

## Live Demo

[Open Schoolytics](https://schoolytics.vercel.app/)

## Features

### Authentication
- Student and Professor role selection.
- Login and registration forms with validation.
- Simulated JWT-based authentication.
- Protected routes and role-based dashboard access.
- Demo account selection.

### Professor Dashboard
- Create, edit, and delete courses.
- Create, edit, and delete assignments.
- Assign work to all or selected enrolled students.
- Support individual and group assignments.
- Track student submissions and pending work.
- View course and assignment progress.

### Student Dashboard
- View enrolled courses and assigned work.
- Acknowledge individual assignments.
- Create or join groups within courses.
- View group members and group assignment status.
- Only group leaders can acknowledge group assignments.
- Identify overdue, pending, and completed assignments.

### Additional Features
- Responsive layout for desktop and mobile.
- Search and status filters.
- Toast notifications.
- Persistent demo data using browser localStorage.

## Tech Stack

- React
- JavaScript
- Tailwind CSS
- React Router
- Lucide React
- Browser localStorage

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/The-Only-Ayush/Schoolytics.git
```

### 2. Navigate to the project directory

```bash
cd Schoolytics
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown in your terminal.

## Project Structure

```text
src/
├── components/
│   ├── AssignmentDetails.jsx
│   ├── AssignmentForm.jsx
│   ├── AssignmentTable.jsx
│   ├── ConfirmDialog.jsx
│   ├── Navbar.jsx
│   ├── Progressbar.jsx
│   ├── Sidebar.jsx
│   ├── StudentSubmissionList.jsx
│   └── ProtectedRoute.jsx
│
├── context/
│   ├── AppContext.jsx
│   └── ToastContext.jsx
│
├── data/
│   ├── accounts.js
│   ├── initialAssignments.js
│   └── initialCourses.js
│
├── pages/
│   ├── AdminDashboard.jsx
│   ├── Login.jsx
│   └── StudentDashboard.jsx
│
└── App.jsx
```

## Authentication & Data

This project is a frontend demonstration. Authentication uses a simulated JWT token, and application data is stored in browser localStorage. It does not currently use a production backend or real server-side authentication.

## Future Improvements

- Integrate a backend API and database.
- Implement real authentication and authorization.
- Add file upload and assignment submission support.
- Add email notifications and deadline reminders.

## Author

**Ayush Singh**

- GitHub: [The-Only-Ayush](https://github.com/The-Only-Ayush)
