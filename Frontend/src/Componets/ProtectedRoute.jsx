import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        return <Navigate to="/login" />;
    }

    // 🔐 role check
    if (allowedRoles && !allowedRoles.includes(loggedInUser.role)) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;
