# Schoolytics – Student Assignment Management System

Schoolytics is a responsive assignment management dashboard designed to simplify communication between students and administrators. It allows administrators to create and manage assignments, track student submissions, and monitor class progress, while students can view their assigned work and update their submission status.

## Features

### Student Dashboard
- View assignments assigned to the logged-in student.
- Search and view assignment details.
- Check assignment deadlines and submission status.
- Access assignment resources through Google Drive links.
- Submit assignments using a two-step confirmation process.
- Track overall submission progress.
- Retain submission status after refreshing the browser.

### Admin Dashboard
- Create, edit, and delete assignments.
- Assign work to all students or selected students.
- View only assignments created by the logged-in administrator.
- Track individual student submission statuses.
- View submitted and pending counts.
- Monitor class completion through progress bars.
- View assignment details and student-wise submission reports.

### Additional Features
- Separate Student and Admin login experiences.
- Demo accounts for testing both roles.
- Responsive interface for desktop and mobile devices.
- Persistent application data using LocalStorage.

## Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Development server and build tool |
| Tailwind CSS | Responsive styling |
| React Router | Client-side navigation |
| Context API | Global state management |
| LocalStorage | Client-side data persistence |
| Lucide React | Icons |

## Getting Started

Follow these steps to run Schoolytics locally.

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

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173
```

### 5. Create a production build

```bash
npm run build
```

## Project Folder Structure

```text
Schoolytics/
│
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── AssignmentDetails.jsx
│   │   ├── AssignmentForm.jsx
│   │   ├── AssignmentTable.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── Navbar.jsx
│   │   ├── Progressbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── StudentSubmissionList.jsx
│   │
│   ├── context/
│   │   └── AppContext.jsx
│   │
│   ├── data/
│   │   ├── accounts.js
│   │   └── initialAssignments.js
│   │
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── Login.jsx
│   │   └── StudentDashboard.jsx
│   │
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Component Architecture

### 1. Pages

- **Login.jsx:** Provides role selection and demo account selection for students and administrators.
- **StudentDashboard.jsx:** Displays student-specific assignments, deadlines, submission status, and progress.
- **AdminDashboard.jsx:** Provides assignment management, class progress tracking, and student submission reports.

### 2. Reusable Components

- **Sidebar.jsx:** Provides role-based navigation.
- **Navbar.jsx:** Displays dashboard navigation and user information.
- **AssignmentForm.jsx:** Handles assignment creation and editing.
- **AssignmentDetails.jsx:** Displays assignment information and submission progress.
- **AssignmentTable.jsx:** Displays assignment records.
- **StudentSubmissionList.jsx:** Displays individual student submission statuses.
- **ConfirmDialog.jsx:** Handles the two-step submission confirmation.
- **Progressbar.jsx:** Visualizes assignment completion progress.

### 3. Context API

`AppContext.jsx` manages shared application state, including:

- Current logged-in user.
- Assignment records.
- Assignment creation, editing, and deletion.
- Student submission updates.

This avoids unnecessary prop drilling and allows different components to access shared application data.

### 4. Data Management

The `data/` directory contains:

- `accounts.js`: Demo student and administrator accounts.
- `initialAssignments.js`: Initial assignment records.

## Key Design Decisions

### Role-Based Dashboards

Separate dashboards are provided for students and administrators to keep their interfaces focused on their respective responsibilities.

### Context API for State Management

React Context API is used to share user and assignment information across the application without passing props through multiple component levels.

### LocalStorage Persistence

LocalStorage is used to preserve assignment information, login state, and submission updates across browser refreshes.

### Responsive Design

The interface is designed to work across desktop, tablet, and mobile screen sizes using Tailwind CSS responsive utilities.

### Reusable Components

Common functionality is separated into reusable components to improve maintainability, readability, and consistency.

## Important Project Limitation

Schoolytics currently uses browser LocalStorage for data persistence and does not have a backend or centralized database.

This means:

- Data is stored locally in the browser.
- Changes are not synchronized between different devices or browsers.
- Demo accounts are intended for demonstration purposes.
- Authentication is not production-grade.

A backend with database integration and secure authentication would be required for a real multi-user deployment.

## Future Improvements

- Backend integration with Node.js and Express.
- MongoDB database integration.
- Secure authentication and authorization.
- Real-time assignment and submission updates.
- Notifications for upcoming deadlines.
- File upload functionality.

## Repository

GitHub: https://github.com/The-Only-Ayush/Schoolytics

---

**Developed by Ayush Singh**  
Schoolytics – Student Assignment Management System