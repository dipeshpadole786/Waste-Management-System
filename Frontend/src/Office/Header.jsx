import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import API from "../API/api_req";

const Headerh = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get Aadhaar from localStorage
    const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const aadhaarNumber = storedUser?.aadhaarNumber;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await API.get(`/user/profile/${aadhaarNumber}`);
                setUser(res.data);
            } catch (err) {
                console.error("Header profile fetch error:", err);
                localStorage.removeItem("loggedInUser");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        if (aadhaarNumber) {
            fetchProfile();
        } else {
            navigate("/login");
            setLoading(false);
        }
    }, [aadhaarNumber, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("loggedInUser");
        navigate("/");
    };

    if (loading) return null; // prevent flicker

    return (
        <header className="simple-header">

            {/* Main Header */}
            <div className="main-header">
                <div className="container">
                    <div className="header-left">
                        <h1 className="system-title">
                            {user?.role === "monitor" ? "SWMS Monitor" : "SWMS User"}
                        </h1>
                        <p className="system-subtitle">
                            Smart Waste Management System
                        </p>
                    </div>

                    <div className="header-right">
                        {user && (
                            <div className="user-section">
                                <span className="user-name">
                                    👤 {user.fullName}
                                </span>
                                <span className="user-role">
                                    ({user.role})
                                </span>
                                <button
                                    className="logout-btn"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </header>
    );
};

export default Headerh;
