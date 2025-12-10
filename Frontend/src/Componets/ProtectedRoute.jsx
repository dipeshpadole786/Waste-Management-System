import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const storedUser = localStorage.getItem("loggedInUser");

    if (!storedUser) {
        return <Navigate to="/" replace />;   // redirect to home
    }

    return children;
};

export default ProtectedRoute;
