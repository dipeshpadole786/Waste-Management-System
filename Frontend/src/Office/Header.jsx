import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import API from "../API/api_req";

const Headerh = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
        if (aadhaarNumber) fetchProfile();
        else { navigate("/login"); setLoading(false); }
    }, [aadhaarNumber, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("loggedInUser");
        navigate("/");
    };

    if (loading) return null;

    const isMonitor = user?.role === "monitor";

    return (
        <header className="hh-header">
            <div className="hh-tricolor"></div>
            <div className="hh-inner">
                <div className="hh-brand">
                    <div className="hh-emblem">☸</div>
                    <div className="hh-brand-text">
                        <div className="hh-title">
                            {isMonitor ? "SWMS Monitor" : "SWMS Portal"}
                        </div>
                        <div className="hh-subtitle">Smart Waste Management System</div>
                    </div>

                    {isMonitor && (
                        <div className="hh-monitor-pill">Monitor</div>
                    )}
                    <a href="/">Home</a>
                </div>

                {user && (
                    <div className="hh-user">
                        <div className="hh-user-info">
                            <div className="hh-avatar">{user.fullName?.charAt(0).toUpperCase()}</div>
                            <div className="hh-user-text">
                                <div className="hh-user-name">{user.fullName}</div>
                                <div className="hh-user-role">{user.role}</div>
                            </div>
                        </div>
                        <button className="hh-logout" onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </header>

    );
};

export default Headerh;