import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { Home } from "./Pages/Home";
import Homef from "./Office/Home";
import Tracking from "./Pages/Tracking";
import FileComplaint from "./Pages/FileComplaint";
import FileSuccess from "./Pages/File_succes";
import TrackStatus from "./Pages/TrackStatus";
import TrainingAwareness from "./Pages/TrainingAwarness";
import Profile from "./Pages/Profile";
import ShowComplaints from "./Office/showcomplain";
import AadhaarLogin from "./Pages/Login";
import UserProgress from "./Office/Userprogress";
import Header from "./Componets/Header";
import Headerh from "./Office/Header";
import Footer from "./Componets/Footer";
import { Top } from "./Componets/top";
import ProtectedRoute from "./Componets/ProtectedRoute";

function Layout() {
  const location = useLocation();
  const [role, setRole] = useState(null);

  // 🔹 get role from localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    setRole(user?.role);
  }, []);

  return (
    <>
      <Top />

      {/* 🔁 HEADER SWITCH BASED ON ROLE */}
      {role === "monitor" ? <Headerh /> : <Header />}

      <Routes>
        {/* 🌐 PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AadhaarLogin />} />

        {/* 👤 USER ROUTES */}
        <Route
          path="/tracking"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Tracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/file-complaint"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <FileComplaint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/filecom"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <FileComplaint />
            </ProtectedRoute>
          }
        />

        <Route
          path="/file_succes"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <FileSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/training"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <TrainingAwareness />
            </ProtectedRoute>
          }
        />

        <Route
          path="/track"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <TrackStatus />
            </ProtectedRoute>
          }
        />

        {/* 🏢 MONITOR ROUTES */}
        <Route
          path="/newhome"
          element={
            <ProtectedRoute allowedRoles={["monitor"]}>
              <Homef />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-progress"
          element={
            <ProtectedRoute allowedRoles={["monitor"]}>
              <UserProgress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/show-complaints"
          element={
            <ProtectedRoute allowedRoles={["monitor"]}>
              <hr />
              <hr />
              <ShowComplaints />
              
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
