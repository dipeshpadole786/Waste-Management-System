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
import SafetyGuidelines from "./Pages/Safety";
import EditArticle from "./Office/ArticalEdit";

function Layout() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    setRole(user?.role);
  }, []);

  return (
    <>
      <Top />

      {/* HEADER BASED ON ROLE */}
      {role === "monitor" ? <Headerh /> : <Header />}

      {/* ✅ SINGLE ROUTES BLOCK */}
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
          path="/safety"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <SafetyGuidelines />
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
              <ShowComplaints />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editArtical"
          element={
            <ProtectedRoute allowedRoles={["monitor"]}>
              <EditArticle />
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
