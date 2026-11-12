
import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, token } = useAppContext();

  // Check whether the user has an active session
  if (!currentUser || !token) {
    return <Navigate to="/" replace />;
  }

  // Check whether the logged-in user has the correct role
  if (currentUser.role !== allowedRole) {
    if (currentUser.role === "student") {
      return <Navigate to="/student" replace />;
    }

    if (currentUser.role === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
